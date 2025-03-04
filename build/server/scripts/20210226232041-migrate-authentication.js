"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;

require("./bootstrap");

var _debug = _interopRequireDefault(require("debug"));

var _models = require("../models");

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug.default)("server");
const cache = {};
let page = 0;
let limit = 100;

async function main(exit = false) {
  const work = async page => {
    log(`Migrating authentication data… page ${page}`);
    const users = await _models.User.findAll({
      limit,
      offset: page * limit,
      paranoid: false,
      order: [["createdAt", "ASC"]],
      where: {
        serviceId: {
          [_sequelize.Op.ne]: "email"
        }
      },
      include: [{
        model: _models.Team,
        as: "team",
        required: true,
        paranoid: false
      }]
    });

    for (const user of users) {
      const provider = user.service;
      const providerId = user.team[`${provider}Id`];

      if (!providerId) {
        console.error(`user ${user.id} has serviceId ${user.serviceId}, but team ${provider}Id missing`);
        continue;
      }

      if (providerId.startsWith("transferred")) {
        console.log(`skipping previously transferred ${user.team.name} (${user.team.id})`);
        continue;
      }

      let authenticationProviderId = cache[providerId];

      if (!authenticationProviderId) {
        const [authenticationProvider] = await _models.AuthenticationProvider.findOrCreate({
          where: {
            name: provider,
            providerId,
            teamId: user.teamId
          }
        });
        cache[providerId] = authenticationProviderId = authenticationProvider.id;
      }

      try {
        await _models.UserAuthentication.create({
          authenticationProviderId,
          providerId: user.serviceId,
          teamId: user.teamId,
          userId: user.id
        });
      } catch (err) {
        console.error(`serviceId ${user.serviceId} exists, for user ${user.id}`);
        continue;
      }
    }

    return users.length === limit ? work(page + 1) : undefined;
  };

  await work(page);

  if (exit) {
    log("Migration complete");
    process.exit(0);
  }
} // In the test suite we import the script rather than run via node CLI


if (process.env.NODE_ENV !== "test") {
  main(true);
}