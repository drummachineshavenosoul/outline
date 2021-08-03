"use strict";

var _factories = require("../test/factories");

var _support = require("../test/support");

beforeEach(() => (0, _support.flushdb)());
describe("collectionIds", () => {
  it("should return non-private collection ids", async () => {
    const team = await (0, _factories.buildTeam)();
    const collection = await (0, _factories.buildCollection)({
      teamId: team.id
    }); // build a collection in another team

    await (0, _factories.buildCollection)(); // build a private collection

    await (0, _factories.buildCollection)({
      teamId: team.id,
      permission: null
    });
    const response = await team.collectionIds();
    expect(response.length).toEqual(1);
    expect(response[0]).toEqual(collection.id);
  });
});
describe("provisionSubdomain", () => {
  it("should set subdomain if available", async () => {
    const team = await (0, _factories.buildTeam)();
    const subdomain = await team.provisionSubdomain("testy");
    expect(subdomain).toEqual("testy");
    expect(team.subdomain).toEqual("testy");
  });
  it("should set subdomain append if unavailable", async () => {
    await (0, _factories.buildTeam)({
      subdomain: "myteam"
    });
    const team = await (0, _factories.buildTeam)();
    const subdomain = await team.provisionSubdomain("myteam");
    expect(subdomain).toEqual("myteam1");
    expect(team.subdomain).toEqual("myteam1");
  });
  it("should increment subdomain append if unavailable", async () => {
    await (0, _factories.buildTeam)({
      subdomain: "myteam"
    });
    await (0, _factories.buildTeam)({
      subdomain: "myteam1"
    });
    const team = await (0, _factories.buildTeam)();
    const subdomain = await team.provisionSubdomain("myteam");
    expect(subdomain).toEqual("myteam2");
    expect(team.subdomain).toEqual("myteam2");
  });
  it("should do nothing if subdomain already set", async () => {
    const team = await (0, _factories.buildTeam)({
      subdomain: "example"
    });
    const subdomain = await team.provisionSubdomain("myteam");
    expect(subdomain).toEqual("example");
    expect(team.subdomain).toEqual("example");
  });
});