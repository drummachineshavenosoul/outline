"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var Sentry = _interopRequireWildcard(require("@sentry/node"));

var _debug = _interopRequireDefault(require("debug"));

var _services = _interopRequireDefault(require("./services"));

var _queue = require("./utils/queue");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const log = (0, _debug.default)("services");
const globalEventsQueue = (0, _queue.createQueue)("global events");
const serviceEventsQueue = (0, _queue.createQueue)("service events"); // this queue processes global events and hands them off to service hooks

globalEventsQueue.process(async job => {
  const names = Object.keys(_services.default);
  names.forEach(name => {
    const service = _services.default[name];

    if (service.on) {
      serviceEventsQueue.add({ ...job.data,
        service: name
      }, {
        removeOnComplete: true
      });
    }
  });
}); // this queue processes an individual event for a specific service

serviceEventsQueue.process(async job => {
  const event = job.data;
  const service = _services.default[event.service];

  if (service.on) {
    log(`${event.service} processing ${event.name}`);
    service.on(event).catch(error => {
      if (process.env.SENTRY_DSN) {
        Sentry.withScope(function (scope) {
          scope.setExtra("event", event);
          Sentry.captureException(error);
        });
      } else {
        throw error;
      }
    });
  }
});
var _default = globalEventsQueue;
exports.default = _default;