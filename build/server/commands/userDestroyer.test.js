"use strict";

var _factories = require("../test/factories");

var _support = require("../test/support");

var _userDestroyer = _interopRequireDefault(require("./userDestroyer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(() => (0, _support.flushdb)());
describe("userDestroyer", () => {
  const ip = "127.0.0.1";
  it("should prevent last user from deleting account", async () => {
    const user = await (0, _factories.buildUser)();
    let error;

    try {
      await (0, _userDestroyer.default)({
        user,
        actor: user,
        ip
      });
    } catch (err) {
      error = err;
    }

    expect(error && error.message).toContain("Cannot delete last user");
  });
  it("should prevent last admin from deleting account", async () => {
    const user = await (0, _factories.buildAdmin)();
    await (0, _factories.buildUser)({
      teamId: user.teamId
    });
    let error;

    try {
      await (0, _userDestroyer.default)({
        user,
        actor: user,
        ip
      });
    } catch (err) {
      error = err;
    }

    expect(error && error.message).toContain("Cannot delete account");
  });
  it("should not prevent multiple admin from deleting account", async () => {
    const actor = await (0, _factories.buildAdmin)();
    const user = await (0, _factories.buildAdmin)({
      teamId: actor.teamId
    });
    let error;

    try {
      await (0, _userDestroyer.default)({
        user,
        actor,
        ip
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeFalsy();
    expect(user.deletedAt).toBeTruthy();
  });
  it("should not prevent last non-admin from deleting account", async () => {
    const user = await (0, _factories.buildUser)();
    await (0, _factories.buildUser)({
      teamId: user.teamId
    });
    let error;

    try {
      await (0, _userDestroyer.default)({
        user,
        actor: user,
        ip
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeFalsy();
    expect(user.deletedAt).toBeTruthy();
  });
});