"use strict";

var _models = require("../models");

var _policy = _interopRequireDefault(require("./policy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  allow
} = _policy.default;
allow(_models.User, "createAttachment", _models.Team, (user, team) => {
  if (!team || user.isViewer || user.teamId !== team.id) return false;
  return true;
});
allow(_models.User, "read", _models.Attachment, (actor, attachment) => {
  if (!attachment || attachment.teamId !== actor.teamId) return false;
  if (actor.isAdmin) return true;
  if (actor.id === attachment.userId) return true;
  return false;
});
allow(_models.User, "delete", _models.Attachment, (actor, attachment) => {
  if (actor.isViewer) return false;
  if (!attachment || attachment.teamId !== actor.teamId) return false;
  if (actor.isAdmin) return true;
  if (actor.id === attachment.userId) return true;
  return false;
});