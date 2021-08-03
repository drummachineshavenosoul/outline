"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userSuspender;

var _sequelize = require("sequelize");

var _errors = require("../errors");

var _models = require("../models");

var _sequelize2 = require("../sequelize");

async function userSuspender({
  user,
  actorId,
  ip
}) {
  if (user.id === actorId) {
    throw new _errors.ValidationError("Unable to suspend the current user");
  }

  await _sequelize2.sequelize.transaction(async transaction => {
    await user.update({
      suspendedById: actorId,
      suspendedAt: new Date()
    }, {
      transaction
    });
    await _models.GroupUser.destroy({
      where: {
        userId: user.id
      },
      transaction
    });
    await _models.Event.create({
      name: "users.suspend",
      actorId,
      userId: user.id,
      teamId: user.teamId,
      data: {
        name: user.name
      },
      ip
    }, {
      transaction
    });
  });
}