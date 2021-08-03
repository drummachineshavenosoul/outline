"use strict";

var _errors = require("../errors");

var _models = require("../models");

var _policy = _interopRequireDefault(require("./policy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  allow
} = _policy.default;
allow(_models.User, "createIntegration", _models.Team, (actor, team) => {
  if (!team || actor.isViewer || actor.teamId !== team.id) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});
allow(_models.User, "read", _models.Integration, (user, integration) => user.teamId === integration.teamId);
allow(_models.User, ["update", "delete"], _models.Integration, (user, integration) => {
  if (user.isViewer) return false;
  if (!integration || user.teamId !== integration.teamId) return false;
  if (user.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});