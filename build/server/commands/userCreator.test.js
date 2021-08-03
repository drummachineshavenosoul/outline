"use strict";

var _factories = require("../test/factories");

var _support = require("../test/support");

var _userCreator = _interopRequireDefault(require("./userCreator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(() => (0, _support.flushdb)());
describe("userCreator", () => {
  const ip = "127.0.0.1";
  it("should update exising user and authentication", async () => {
    const existing = await (0, _factories.buildUser)();
    const authentications = await existing.getAuthentications();
    const existingAuth = authentications[0];
    const newEmail = "test@example.com";
    const result = await (0, _userCreator.default)({
      name: existing.name,
      email: newEmail,
      avatarUrl: existing.avatarUrl,
      teamId: existing.teamId,
      ip,
      authentication: {
        authenticationProviderId: existingAuth.authenticationProviderId,
        providerId: existingAuth.providerId,
        accessToken: "123",
        scopes: ["read"]
      }
    });
    const {
      user,
      authentication,
      isNewUser
    } = result;
    expect(authentication.accessToken).toEqual("123");
    expect(authentication.scopes.length).toEqual(1);
    expect(authentication.scopes[0]).toEqual("read");
    expect(user.email).toEqual(newEmail);
    expect(isNewUser).toEqual(false);
  });
  it("should create user with deleted user matching providerId", async () => {
    const existing = await (0, _factories.buildUser)();
    const authentications = await existing.getAuthentications();
    const existingAuth = authentications[0];
    const newEmail = "test@example.com";
    await existing.destroy();
    const result = await (0, _userCreator.default)({
      name: "Test Name",
      email: "test@example.com",
      teamId: existing.teamId,
      ip,
      authentication: {
        authenticationProviderId: existingAuth.authenticationProviderId,
        providerId: existingAuth.providerId,
        accessToken: "123",
        scopes: ["read"]
      }
    });
    const {
      user,
      authentication,
      isNewUser
    } = result;
    expect(authentication.accessToken).toEqual("123");
    expect(authentication.scopes.length).toEqual(1);
    expect(authentication.scopes[0]).toEqual("read");
    expect(user.email).toEqual(newEmail);
    expect(isNewUser).toEqual(true);
  });
  it("should handle duplicate providerId for different iDP", async () => {
    const existing = await (0, _factories.buildUser)();
    const authentications = await existing.getAuthentications();
    const existingAuth = authentications[0];
    let error;

    try {
      await (0, _userCreator.default)({
        name: "Test Name",
        email: "test@example.com",
        teamId: existing.teamId,
        ip,
        authentication: {
          authenticationProviderId: "example.org",
          providerId: existingAuth.providerId,
          accessToken: "123",
          scopes: ["read"]
        }
      });
    } catch (err) {
      error = err;
    }

    expect(error && error.toString()).toContain("already exists for");
  });
  it("should create a new user", async () => {
    const team = await (0, _factories.buildTeam)();
    const authenticationProviders = await team.getAuthenticationProviders();
    const authenticationProvider = authenticationProviders[0];
    const result = await (0, _userCreator.default)({
      name: "Test Name",
      email: "test@example.com",
      teamId: team.id,
      ip,
      authentication: {
        authenticationProviderId: authenticationProvider.id,
        providerId: "fake-service-id",
        accessToken: "123",
        scopes: ["read"]
      }
    });
    const {
      user,
      authentication,
      isNewUser
    } = result;
    expect(authentication.accessToken).toEqual("123");
    expect(authentication.scopes.length).toEqual(1);
    expect(authentication.scopes[0]).toEqual("read");
    expect(user.email).toEqual("test@example.com");
    expect(isNewUser).toEqual(true);
  });
  it("should create a user from an invited user", async () => {
    const team = await (0, _factories.buildTeam)();
    const invite = await (0, _factories.buildInvite)({
      teamId: team.id
    });
    const authenticationProviders = await team.getAuthenticationProviders();
    const authenticationProvider = authenticationProviders[0];
    const result = await (0, _userCreator.default)({
      name: invite.name,
      email: invite.email,
      teamId: invite.teamId,
      ip,
      authentication: {
        authenticationProviderId: authenticationProvider.id,
        providerId: "fake-service-id",
        accessToken: "123",
        scopes: ["read"]
      }
    });
    const {
      user,
      authentication,
      isNewUser
    } = result;
    expect(authentication.accessToken).toEqual("123");
    expect(authentication.scopes.length).toEqual(1);
    expect(authentication.scopes[0]).toEqual("read");
    expect(user.email).toEqual(invite.email);
    expect(isNewUser).toEqual(true);
  });
});