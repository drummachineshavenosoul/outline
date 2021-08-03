"use strict";

var _errors = require("../errors");

var _models = require("../models");

var _policy = _interopRequireDefault(require("./policy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  allow
} = _policy.default;
allow(_models.User, "createGroup", _models.Team, (actor, team) => {
  if (!team || actor.isViewer || actor.teamId !== team.id) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});
allow(_models.User, "read", _models.Group, (actor, group) => {
  if (!group || actor.teamId !== group.teamId) return false;
  if (actor.isAdmin) return true;

  if (group.groupMemberships.filter(gm => gm.userId === actor.id).length) {
    return true;
  }

  return false;
});
allow(_models.User, ["update", "delete"], _models.Group, (actor, group) => {
  if (!group || actor.isViewer || actor.teamId !== group.teamId) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});