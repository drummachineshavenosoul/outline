"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const GroupUser = _sequelize.sequelize.define("group_user", {}, {
  timestamps: true,
  paranoid: true
});

GroupUser.associate = models => {
  GroupUser.belongsTo(models.Group, {
    as: "group",
    foreignKey: "groupId",
    primary: true
  });
  GroupUser.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId",
    primary: true
  });
  GroupUser.belongsTo(models.User, {
    as: "createdBy",
    foreignKey: "createdById"
  });
  GroupUser.addScope("defaultScope", {
    include: [{
      association: "user"
    }]
  });
};

var _default = GroupUser;
exports.default = _default;