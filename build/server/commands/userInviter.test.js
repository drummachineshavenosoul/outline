"use strict";

var _factories = require("../test/factories");

var _support = require("../test/support");

var _userInviter = _interopRequireDefault(require("./userInviter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
beforeEach(() => (0, _support.flushdb)());
describe("userInviter", () => {
  const ip = "127.0.0.1";
  it("should return sent invites", async () => {
    const user = await (0, _factories.buildUser)();
    const response = await (0, _userInviter.default)({
      invites: [{
        email: "test@example.com",
        name: "Test"
      }],
      user,
      ip
    });
    expect(response.sent.length).toEqual(1);
  });
  it("should filter empty invites", async () => {
    const user = await (0, _factories.buildUser)();
    const response = await (0, _userInviter.default)({
      invites: [{
        email: " ",
        name: "Test"
      }],
      user,
      ip
    });
    expect(response.sent.length).toEqual(0);
  });
  it("should filter obviously bunk emails", async () => {
    const user = await (0, _factories.buildUser)();
    const response = await (0, _userInviter.default)({
      invites: [{
        email: "notanemail",
        name: "Test"
      }],
      user,
      ip
    });
    expect(response.sent.length).toEqual(0);
  });
  it("should not send duplicates", async () => {
    const user = await (0, _factories.buildUser)();
    const response = await (0, _userInviter.default)({
      invites: [{
        email: "the@same.com",
        name: "Test"
      }, {
        email: "the@SAME.COM",
        name: "Test"
      }],
      user,
      ip
    });
    expect(response.sent.length).toEqual(1);
  });
  it("should not send invites to existing team members", async () => {
    const user = await (0, _factories.buildUser)();
    const response = await (0, _userInviter.default)({
      invites: [{
        email: user.email,
        name: user.name
      }],
      user,
      ip
    });
    expect(response.sent.length).toEqual(0);
  });
});