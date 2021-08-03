"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("../events"));

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Event = _sequelize.sequelize.define("event", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  modelId: _sequelize.DataTypes.UUID,
  name: _sequelize.DataTypes.STRING,
  ip: _sequelize.DataTypes.STRING,
  data: _sequelize.DataTypes.JSONB
});

Event.associate = models => {
  Event.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
  Event.belongsTo(models.User, {
    as: "actor",
    foreignKey: "actorId"
  });
  Event.belongsTo(models.Collection, {
    as: "collection",
    foreignKey: "collectionId"
  });
  Event.belongsTo(models.Collection, {
    as: "document",
    foreignKey: "documentId"
  });
  Event.belongsTo(models.Team, {
    as: "team",
    foreignKey: "teamId"
  });
};

Event.beforeCreate(event => {
  if (event.ip) {
    // cleanup IPV6 representations of IPV4 addresses
    event.ip = event.ip.replace(/^::ffff:/, "");
  }
});
Event.afterCreate(event => {
  _events.default.add(event, {
    removeOnComplete: true
  });
}); // add can be used to send events into the event system without recording them
// in the database / audit trail

Event.add = event => {
  _events.default.add(Event.build(event), {
    removeOnComplete: true
  });
};

Event.ACTIVITY_EVENTS = ["collections.create", "collections.delete", "collections.move", "documents.publish", "documents.archive", "documents.unarchive", "documents.pin", "documents.unpin", "documents.move", "documents.delete", "documents.permanent_delete", "documents.restore", "revisions.create", "users.create"];
Event.AUDIT_EVENTS = ["api_keys.create", "api_keys.delete", "authenticationProviders.update", "collections.create", "collections.update", "collections.move", "collections.add_user", "collections.remove_user", "collections.add_group", "collections.remove_group", "collections.delete", "documents.create", "documents.publish", "documents.update", "documents.archive", "documents.unarchive", "documents.pin", "documents.unpin", "documents.move", "documents.delete", "documents.permanent_delete", "documents.restore", "groups.create", "groups.update", "groups.delete", "revisions.create", "shares.create", "shares.update", "shares.revoke", "teams.update", "users.create", "users.update", "users.signin", "users.promote", "users.demote", "users.invite", "users.suspend", "users.activate", "users.delete"];
var _default = Event;
exports.default = _default;