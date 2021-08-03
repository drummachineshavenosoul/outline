"use strict";

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

var _userSuspender = _interopRequireDefault(require("./userSuspender"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
beforeEach(() => (0, _support.flushdb)());
describe("userSuspender", () => {
  const ip = "127.0.0.1";
  it("should not suspend self", async () => {
    const user = await (0, _factories.buildUser)();
    let error;

    try {
      await (0, _userSuspender.default)({
        actorId: user.id,
        user,
        ip
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toEqual("Unable to suspend the current user");
  });
  it("should suspend the user", async () => {
    const admin = await (0, _factories.buildAdmin)();
    const user = await (0, _factories.buildUser)({
      teamId: admin.teamId
    });
    await (0, _userSuspender.default)({
      actorId: admin.id,
      user,
      ip
    });
    expect(user.suspendedAt).toBeTruthy();
    expect(user.suspendedById).toEqual(admin.id);
  });
  it("should remove group memberships", async () => {
    const admin = await (0, _factories.buildAdmin)();
    const user = await (0, _factories.buildUser)({
      teamId: admin.teamId
    });
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    await group.addUser(user, {
      through: {
        createdById: user.id
      }
    });
    await (0, _userSuspender.default)({
      actorId: admin.id,
      user,
      ip
    });
    expect(user.suspendedAt).toBeTruthy();
    expect(user.suspendedById).toEqual(admin.id);
    expect(await _models.GroupUser.count()).toEqual(0);
  });
});