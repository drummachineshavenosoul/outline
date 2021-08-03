"use strict";

var _models = require("../models");

var _policy = _interopRequireDefault(require("./policy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  allow
} = _policy.default;
allow(_models.User, "read", _models.Team, (user, team) => team && user.teamId === team.id);
allow(_models.User, "share", _models.Team, (user, team) => {
  if (!team || user.isViewer || user.teamId !== team.id) return false;
  return team.sharing;
});
allow(_models.User, ["update", "export", "manage"], _models.Team, (user, team) => {
  if (!team || user.isViewer || user.teamId !== team.id) return false;
  return user.isAdmin;
});