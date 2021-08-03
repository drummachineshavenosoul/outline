"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkMigrations = checkMigrations;

var _models = require("../models");

async function checkMigrations() {
  if (process.env.DEPLOYMENT === "hosted") {
    return;
  }

  const teams = await _models.Team.count();
  const providers = await _models.AuthenticationProvider.count();

  if (teams && !providers) {
    console.error(`
This version of Outline cannot start until a data migration is complete.
Backup your database, run the database migrations and the following script:

$ node ./build/server/scripts/20210226232041-migrate-authentication.js
`);
    process.exit(1);
  }
}