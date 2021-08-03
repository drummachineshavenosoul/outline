"use strict";

var _models = require("../models");

var _support = require("../test/support");

var _migrateAuthentication = _interopRequireDefault(require("./20210226232041-migrate-authentication"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(() => (0, _support.flushdb)());
describe("#work", () => {
  it("should create authentication record for users", async () => {
    const team = await _models.Team.create({
      name: `Test`,
      slackId: "T123"
    });
    const user = await _models.User.create({
      email: `test@example.com`,
      name: `Test`,
      serviceId: "U123",
      teamId: team.id
    });
    await (0, _migrateAuthentication.default)();
    const authProvider = await _models.AuthenticationProvider.findOne({
      where: {
        providerId: "T123"
      }
    });
    const auth = await _models.UserAuthentication.findOne({
      where: {
        providerId: "U123"
      }
    });
    expect(authProvider.name).toEqual("slack");
    expect(auth.userId).toEqual(user.id);
  });
  it("should create authentication record for deleted users", async () => {
    const team = await _models.Team.create({
      name: `Test`,
      googleId: "domain.com"
    });
    const user = await _models.User.create({
      email: `test1@example.com`,
      name: `Test`,
      service: "google",
      serviceId: "123456789",
      teamId: team.id,
      deletedAt: new Date()
    });
    await (0, _migrateAuthentication.default)();
    const authProvider = await _models.AuthenticationProvider.findOne({
      where: {
        providerId: "domain.com"
      }
    });
    const auth = await _models.UserAuthentication.findOne({
      where: {
        providerId: "123456789"
      }
    });
    expect(authProvider.name).toEqual("google");
    expect(auth.userId).toEqual(user.id);
  });
  it("should create authentication record for suspended users", async () => {
    const team = await _models.Team.create({
      name: `Test`,
      googleId: "example.com"
    });
    const user = await _models.User.create({
      email: `test1@example.com`,
      name: `Test`,
      service: "google",
      serviceId: "123456789",
      teamId: team.id,
      suspendedAt: new Date()
    });
    await (0, _migrateAuthentication.default)();
    const authProvider = await _models.AuthenticationProvider.findOne({
      where: {
        providerId: "example.com"
      }
    });
    const auth = await _models.UserAuthentication.findOne({
      where: {
        providerId: "123456789"
      }
    });
    expect(authProvider.name).toEqual("google");
    expect(auth.userId).toEqual(user.id);
  });
  it("should create correct authentication record when team has both slackId and googleId", async () => {
    const team = await _models.Team.create({
      name: `Test`,
      slackId: "T456",
      googleId: "example.com"
    });
    const user = await _models.User.create({
      email: `test1@example.com`,
      name: `Test`,
      service: "slack",
      serviceId: "U456",
      teamId: team.id
    });
    await (0, _migrateAuthentication.default)();
    const authProvider = await _models.AuthenticationProvider.findOne({
      where: {
        providerId: "T456"
      }
    });
    const auth = await _models.UserAuthentication.findOne({
      where: {
        providerId: "U456"
      }
    });
    expect(authProvider.name).toEqual("slack");
    expect(auth.userId).toEqual(user.id);
  });
  it("should skip invited users", async () => {
    const team = await _models.Team.create({
      name: `Test`,
      slackId: "T789"
    });
    await _models.User.create({
      email: `test2@example.com`,
      name: `Test`,
      teamId: team.id
    });
    await (0, _migrateAuthentication.default)();
    const count = await _models.UserAuthentication.count();
    expect(count).toEqual(0);
  });
});