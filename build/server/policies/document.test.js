"use strict";

var _factories = require("../test/factories");

var _support = require("../test/support");

var _index = require("./index");

beforeEach(() => (0, _support.flushdb)());
describe("read_write collection", () => {
  it("should allow read write permissions for team member", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)({
      teamId: team.id
    });
    const collection = await (0, _factories.buildCollection)({
      teamId: team.id,
      permission: "read_write"
    });
    const document = await (0, _factories.buildDocument)({
      teamId: team.id,
      collectionId: collection.id
    });
    const abilities = (0, _index.serialize)(user, document);
    expect(abilities.read).toEqual(true);
    expect(abilities.download).toEqual(true);
    expect(abilities.update).toEqual(true);
    expect(abilities.createChildDocument).toEqual(true);
    expect(abilities.archive).toEqual(true);
    expect(abilities.delete).toEqual(true);
    expect(abilities.share).toEqual(true);
    expect(abilities.move).toEqual(true);
  });
});
describe("read collection", () => {
  it("should allow read only permissions permissions for team member", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)({
      teamId: team.id
    });
    const collection = await (0, _factories.buildCollection)({
      teamId: team.id,
      permission: "read"
    });
    const document = await (0, _factories.buildDocument)({
      teamId: team.id,
      collectionId: collection.id
    });
    const abilities = (0, _index.serialize)(user, document);
    expect(abilities.read).toEqual(true);
    expect(abilities.download).toEqual(true);
    expect(abilities.update).toEqual(false);
    expect(abilities.createChildDocument).toEqual(false);
    expect(abilities.archive).toEqual(false);
    expect(abilities.delete).toEqual(false);
    expect(abilities.share).toEqual(false);
    expect(abilities.move).toEqual(false);
  });
});
describe("private collection", () => {
  it("should allow no permissions for team member", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)({
      teamId: team.id
    });
    const collection = await (0, _factories.buildCollection)({
      teamId: team.id,
      permission: null
    });
    const document = await (0, _factories.buildDocument)({
      teamId: team.id,
      collectionId: collection.id
    });
    const abilities = (0, _index.serialize)(user, document);
    expect(abilities.read).toEqual(false);
    expect(abilities.download).toEqual(false);
    expect(abilities.update).toEqual(false);
    expect(abilities.createChildDocument).toEqual(false);
    expect(abilities.archive).toEqual(false);
    expect(abilities.delete).toEqual(false);
    expect(abilities.share).toEqual(false);
    expect(abilities.move).toEqual(false);
  });
});