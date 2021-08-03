"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const Notification = _sequelize.sequelize.define("notification", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  event: {
    type: _sequelize.DataTypes.STRING
  },
  email: {
    type: _sequelize.DataTypes.BOOLEAN
  }
}, {
  timestamps: true,
  updatedAt: false
});

Notification.associate = models => {
  Notification.belongsTo(models.User, {
    as: "actor",
    foreignKey: "actorId"
  });
  Notification.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
};

var _default = Notification;
exports.default = _default;