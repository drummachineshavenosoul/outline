"use strict";

var _factories = require("../test/factories");

var _support = require("../test/support");

var _index = require("./index");

beforeEach(() => (0, _support.flushdb)());
it("should serialize policy", async () => {
  const user = await (0, _factories.buildUser)();
  const response = (0, _index.serialize)(user, user);
  expect(response.update).toEqual(true);
  expect(response.delete).toEqual(true);
});
it("should serialize domain policies on Team", async () => {
  const team = await (0, _factories.buildTeam)();
  const user = await (0, _factories.buildUser)({
    teamId: team.id
  });
  const response = (0, _index.serialize)(user, team);
  expect(response.createDocument).toEqual(true);
  expect(response.inviteUser).toEqual(false);
});