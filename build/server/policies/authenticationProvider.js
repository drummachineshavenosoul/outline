"use strict";

var _errors = require("../errors");

var _models = require("../models");

var _policy = _interopRequireDefault(require("./policy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  allow
} = _policy.default;
allow(_models.User, "createAuthenticationProvider", _models.Team, (actor, team) => {
  if (!team || actor.teamId !== team.id) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});
allow(_models.User, "read", _models.AuthenticationProvider, (actor, authenticationProvider) => actor && actor.teamId === authenticationProvider.teamId);
allow(_models.User, ["update", "delete"], _models.AuthenticationProvider, (actor, authenticationProvider) => {
  if (actor.teamId !== authenticationProvider.teamId) return false;
  if (actor.isAdmin) return true;
  throw new _errors.AdminRequiredError();
});