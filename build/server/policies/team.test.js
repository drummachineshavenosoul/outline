"use strict";

var _factories = require("../test/factories");

var _support = require("../test/support");

var _index = require("./index");

beforeEach(() => (0, _support.flushdb)());
it("should allow reading only", async () => {
  const team = await (0, _factories.buildTeam)();
  const user = await (0, _factories.buildUser)({
    teamId: team.id
  });
  const abilities = (0, _index.serialize)(user, team);
  expect(abilities.read).toEqual(true);
  expect(abilities.manage).toEqual(false);
  expect(abilities.createAttachment).toEqual(true);
  expect(abilities.createCollection).toEqual(true);
  expect(abilities.createDocument).toEqual(true);
  expect(abilities.createGroup).toEqual(false);
  expect(abilities.createIntegration).toEqual(false);
});
it("should allow admins to manage", async () => {
  const team = await (0, _factories.buildTeam)();
  const admin = await (0, _factories.buildAdmin)({
    teamId: team.id
  });
  const abilities = (0, _index.serialize)(admin, team);
  expect(abilities.read).toEqual(true);
  expect(abilities.manage).toEqual(true);
  expect(abilities.createAttachment).toEqual(true);
  expect(abilities.createCollection).toEqual(true);
  expect(abilities.createDocument).toEqual(true);
  expect(abilities.createGroup).toEqual(true);
  expect(abilities.createIntegration).toEqual(true);
});