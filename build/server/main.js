"use strict";

require("core-js/modules/esnext.map.delete-all");

require("core-js/modules/esnext.map.every");

require("core-js/modules/esnext.map.filter");

require("core-js/modules/esnext.map.find");

require("core-js/modules/esnext.map.find-key");

require("core-js/modules/esnext.map.includes");

require("core-js/modules/esnext.map.key-of");

require("core-js/modules/esnext.map.map-keys");

require("core-js/modules/esnext.map.map-values");

require("core-js/modules/esnext.map.merge");

require("core-js/modules/esnext.map.reduce");

require("core-js/modules/esnext.map.some");

require("core-js/modules/esnext.map.update");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.start = start;
exports.default = exports.socketio = void 0;

var _http = _interopRequireDefault(require("http"));

var Sentry = _interopRequireWildcard(require("@sentry/node"));

var _socket = _interopRequireDefault(require("socket.io"));

var _socket2 = _interopRequireDefault(require("socket.io-redis"));

var _socketioAuth = _interopRequireDefault(require("socketio-auth"));

var _app = _interopRequireDefault(require("./app"));

var _models = require("./models");

var _policies = _interopRequireDefault(require("./policies"));

var _redis = require("./redis");

var _jwt = require("./utils/jwt");

var metrics = _interopRequireWildcard(require("./utils/metrics"));

var _startup = require("./utils/startup");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const server = _http.default.createServer(_app.default.callback());

let io;
const {
  can
} = _policies.default;
io = (0, _socket.default)(server, {
  path: "/realtime",
  serveClient: false,
  cookie: false
});
io.adapter((0, _socket2.default)({
  pubClient: _redis.client,
  subClient: _redis.subscriber
}));
io.origins((_, callback) => {
  callback(null, true);
});
io.of("/").adapter.on("error", err => {
  if (err.name === "MaxRetriesPerRequestError") {
    console.error(`Redis error: ${err.message}. Shutting down now.`);
    throw err;
  } else {
    console.error(`Redis error: ${err.message}`);
  }
});
io.on("connection", socket => {
  metrics.increment("websockets.connected");
  metrics.gaugePerInstance("websockets.count", socket.client.conn.server.clientsCount);
  socket.on("disconnect", () => {
    metrics.increment("websockets.disconnected");
    metrics.gaugePerInstance("websockets.count", socket.client.conn.server.clientsCount);
  });
});
(0, _socketioAuth.default)(io, {
  authenticate: async (socket, data, callback) => {
    const {
      token
    } = data;

    try {
      const user = await (0, _jwt.getUserForJWT)(token);
      socket.client.user = user; // store the mapping between socket id and user id in redis
      // so that it is accessible across multiple server nodes

      await _redis.client.hset(socket.id, "userId", user.id);
      return callback(null, true);
    } catch (err) {
      return callback(err);
    }
  },
  postAuthenticate: async (socket, data) => {
    const {
      user
    } = socket.client; // the rooms associated with the current team
    // and user so we can send authenticated events

    let rooms = [`team-${user.teamId}`, `user-${user.id}`]; // the rooms associated with collections this user
    // has access to on connection. New collection subscriptions
    // are managed from the client as needed through the 'join' event

    const collectionIds = await user.collectionIds();
    collectionIds.forEach(collectionId => rooms.push(`collection-${collectionId}`)); // join all of the rooms at once

    socket.join(rooms); // allow the client to request to join rooms

    socket.on("join", async event => {
      // user is joining a collection channel, because their permissions have
      // changed, granting them access.
      if (event.collectionId) {
        const collection = await _models.Collection.scope({
          method: ["withMembership", user.id]
        }).findByPk(event.collectionId);

        if (can(user, "read", collection)) {
          socket.join(`collection-${event.collectionId}`, () => {
            metrics.increment("websockets.collections.join");
          });
        }
      } // user is joining a document channel, because they have navigated to
      // view a document.


      if (event.documentId) {
        const document = await _models.Document.findByPk(event.documentId, {
          userId: user.id
        });

        if (can(user, "read", document)) {
          const room = `document-${event.documentId}`;
          await _models.View.touch(event.documentId, user.id, event.isEditing);
          const editing = await _models.View.findRecentlyEditingByDocument(event.documentId);
          socket.join(room, () => {
            metrics.increment("websockets.documents.join"); // let everyone else in the room know that a new user joined

            io.to(room).emit("user.join", {
              userId: user.id,
              documentId: event.documentId,
              isEditing: event.isEditing
            }); // let this user know who else is already present in the room

            io.in(room).clients(async (err, sockets) => {
              if (err) {
                if (process.env.SENTRY_DSN) {
                  Sentry.withScope(function (scope) {
                    scope.setExtra("clients", sockets);
                    Sentry.captureException(err);
                  });
                } else {
                  console.error(err);
                }

                return;
              } // because a single user can have multiple socket connections we
              // need to make sure that only unique userIds are returned. A Map
              // makes this easy.


              let userIds = new Map();

              for (const socketId of sockets) {
                const userId = await _redis.client.hget(socketId, "userId");
                userIds.set(userId, userId);
              }

              socket.emit("document.presence", {
                documentId: event.documentId,
                userIds: Array.from(userIds.keys()),
                editingIds: editing.map(view => view.userId)
              });
            });
          });
        }
      }
    }); // allow the client to request to leave rooms

    socket.on("leave", event => {
      if (event.collectionId) {
        socket.leave(`collection-${event.collectionId}`, () => {
          metrics.increment("websockets.collections.leave");
        });
      }

      if (event.documentId) {
        const room = `document-${event.documentId}`;
        socket.leave(room, () => {
          metrics.increment("websockets.documents.leave");
          io.to(room).emit("user.leave", {
            userId: user.id,
            documentId: event.documentId
          });
        });
      }
    });
    socket.on("disconnecting", () => {
      const rooms = Object.keys(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith("document-")) {
          const documentId = room.replace("document-", "");
          io.to(room).emit("user.leave", {
            userId: user.id,
            documentId
          });
        }
      });
    });
    socket.on("presence", async event => {
      metrics.increment("websockets.presence");
      const room = `document-${event.documentId}`;

      if (event.documentId && socket.rooms[room]) {
        const view = await _models.View.touch(event.documentId, user.id, event.isEditing);
        view.user = user;
        io.to(room).emit("user.presence", {
          userId: user.id,
          documentId: event.documentId,
          isEditing: event.isEditing
        });
      }
    });
  }
});
server.on("error", err => {
  throw err;
});
server.on("listening", () => {
  const address = server.address();
  console.log(`\n> Listening on http://localhost:${address.port}\n`);
});

async function start(id) {
  console.log(`Started worker ${id}`);
  await (0, _startup.checkMigrations)();
  server.listen(process.env.PORT || "3000");
}

const socketio = io;
exports.socketio = socketio;
var _default = server;
exports.default = _default;