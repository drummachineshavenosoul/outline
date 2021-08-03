"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = accountProvisioner;

var _invariant = _interopRequireDefault(require("invariant"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _errors = require("../errors");

var _mailer = require("../mailer");

var _models = require("../models");

var _teamCreator = _interopRequireDefault(require("./teamCreator"));

var _userCreator = _interopRequireDefault(require("./userCreator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function accountProvisioner({
  ip,
  user: userParams,
  team: teamParams,
  authenticationProvider: authenticationProviderParams,
  authentication: authenticationParams
}) {
  let result;

  try {
    result = await (0, _teamCreator.default)({
      name: teamParams.name,
      domain: teamParams.domain,
      subdomain: teamParams.subdomain,
      avatarUrl: teamParams.avatarUrl,
      authenticationProvider: authenticationProviderParams
    });
  } catch (err) {
    throw new _errors.AuthenticationError(err.message);
  }

  (0, _invariant.default)(result, "Team creator result must exist");
  const {
    authenticationProvider,
    team,
    isNewTeam
  } = result;

  if (!authenticationProvider.enabled) {
    throw new _errors.AuthenticationProviderDisabledError();
  }

  try {
    const result = await (0, _userCreator.default)({
      name: userParams.name,
      email: userParams.email,
      isAdmin: isNewTeam,
      avatarUrl: userParams.avatarUrl,
      teamId: team.id,
      ip,
      authentication: { ...authenticationParams,
        authenticationProviderId: authenticationProvider.id
      }
    });
    const {
      isNewUser,
      user
    } = result;

    if (isNewUser) {
      (0, _mailer.sendEmail)("welcome", user.email, {
        teamUrl: team.url
      });
    }

    if (isNewUser || isNewTeam) {
      let provision = isNewTeam; // accounts for the case where a team is provisioned, but the user creation
      // failed. In this case we have a valid previously created team but no
      // onboarding collection.

      if (!isNewTeam) {
        const count = await _models.Collection.count({
          where: {
            teamId: team.id
          }
        });
        provision = count === 0;
      }

      if (provision) {
        await team.provisionFirstCollection(user.id);
      }
    }

    return {
      user,
      team,
      isNewUser,
      isNewTeam
    };
  } catch (err) {
    if (err instanceof _sequelize.default.UniqueConstraintError) {
      const exists = await _models.User.findOne({
        where: {
          email: userParams.email,
          teamId: team.id
        }
      });

      if (exists) {
        throw new _errors.EmailAuthenticationRequiredError("Email authentication required", team.url);
      } else {
        throw new _errors.AuthenticationError(err.message, team.url);
      }
    }

    throw err;
  }
}