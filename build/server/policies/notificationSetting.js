"use strict";

var _models = require("../models");

var _policy = _interopRequireDefault(require("./policy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  allow
} = _policy.default;
allow(_models.User, "createNotificationSetting", _models.Team, (user, team) => {
  if (!team || user.teamId !== team.id) return false;
  return true;
});
allow(_models.User, ["read", "update", "delete"], _models.NotificationSetting, (user, setting) => user && user.id === setting.userId);