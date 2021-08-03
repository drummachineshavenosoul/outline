"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = teamCreator;

var _debug = _interopRequireDefault(require("debug"));

var _errors = require("../errors");

var _models = require("../models");

var _sequelize = require("../sequelize");

var _authentication = require("../utils/authentication");

var _avatars = require("../utils/avatars");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug.default)("server");

async function teamCreator({
  name,
  domain,
  subdomain,
  avatarUrl,
  authenticationProvider
}) {
  let authP = await _models.AuthenticationProvider.findOne({
    where: authenticationProvider,
    include: [{
      model: _models.Team,
      as: "team",
      required: true
    }]
  }); // This authentication provider already exists which means we have a team and
  // there is nothing left to do but return the existing credentials

  if (authP) {
    return {
      authenticationProvider: authP,
      team: authP.team,
      isNewTeam: false
    };
  } // This team has never been seen before, if self hosted the logic is different
  // to the multi-tenant version, we want to restrict to a single team that MAY
  // have multiple authentication providers


  if (process.env.DEPLOYMENT !== "hosted") {
    const teamCount = await _models.Team.count(); // If the self-hosted installation has a single team and the domain for the
    // new team matches one in the allowed domains env variable then assign the
    // authentication provider to the existing team

    if (teamCount === 1 && domain && (0, _authentication.getAllowedDomains)().includes(domain)) {
      const team = await _models.Team.findOne();
      authP = await team.createAuthenticationProvider(authenticationProvider);
      return {
        authenticationProvider: authP,
        team,
        isNewTeam: false
      };
    }

    if (teamCount >= 1) {
      throw new _errors.MaximumTeamsError();
    }
  } // If the service did not provide a logo/avatar then we attempt to generate
  // one via ClearBit, or fallback to colored initials in worst case scenario


  if (!avatarUrl) {
    avatarUrl = await (0, _avatars.generateAvatarUrl)({
      name,
      domain,
      id: subdomain
    });
  }

  let transaction = await _sequelize.sequelize.transaction();
  let team;

  try {
    team = await _models.Team.create({
      name,
      avatarUrl,
      authenticationProviders: [authenticationProvider]
    }, {
      include: "authenticationProviders",
      transaction
    });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  try {
    await team.provisionSubdomain(subdomain);
  } catch (err) {
    log(`Provisioning subdomain failed: ${err.message}`);
  }

  return {
    team,
    authenticationProvider: team.authenticationProviders[0],
    isNewTeam: true
  };
}