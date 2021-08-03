"use strict";

var _errors = require("../errors");

var _models = require("../models");

var _policy = _interopRequireDefault(require("./policy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  allow
} = _policy.default;
allow(_models.User, "read", _models.User, (actor, user) => user && user.teamId === actor.teamId);
allow(_models.User, "inviteUser", _models.Team, (actor, team) => {
  if (!team || actor.teamId !== team.id) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});
allow(_models.User, "update", _models.User, (actor, user) => {
  if (!user || user.teamId !== actor.teamId) return false;
  if (user.id === actor.id) return true;
  throw new _errors.AdminRequiredError();
});
allow(_models.User, "delete", _models.User, (actor, user) => {
  if (!user || user.teamId !== actor.teamId) return false;
  if (user.id === actor.id) return true;
  if (actor.isAdmin && !user.lastActiveAt) return true;
  throw new _errors.AdminRequiredError();
});
allow(_models.User, ["activate", "suspend"], _models.User, (actor, user) => {
  if (!user || user.teamId !== actor.teamId) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});
allow(_models.User, "readDetails", _models.User, (actor, user) => {
  if (!user || user.teamId !== actor.teamId) return false;
  if (user === actor) return true;
  return actor.isAdmin;
});
allow(_models.User, "promote", _models.User, (actor, user) => {
  if (!user || user.teamId !== actor.teamId) return false;
  if (user.isAdmin || user.isSuspended) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});
allow(_models.User, "demote", _models.User, (actor, user) => {
  if (!user || user.teamId !== actor.teamId) return false;
  if (user.isSuspended) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});