"use strict";

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _uuid = require("uuid");

var _app = _interopRequireDefault(require("../app"));

var _factories = require("../test/factories");

var _support = require("../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const server = new _fetchTestServer.default(_app.default.callback());
beforeEach(() => (0, _support.flushdb)());
afterAll(() => server.close());
describe("#authenticationProviders.info", () => {
  it("should return auth provider", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)({
      teamId: team.id
    });
    const authenticationProviders = await team.getAuthenticationProviders();
    const res = await server.post("/api/authenticationProviders.info", {
      body: {
        id: authenticationProviders[0].id,
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toBe("slack");
    expect(body.data.isEnabled).toBe(true);
    expect(body.data.isConnected).toBe(true);
    expect(body.policies[0].abilities.read).toBe(true);
    expect(body.policies[0].abilities.update).toBe(false);
  });
  it("should require authorization", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)();
    const authenticationProviders = await team.getAuthenticationProviders();
    const res = await server.post("/api/authenticationProviders.info", {
      body: {
        id: authenticationProviders[0].id,
        token: user.getJwtToken()
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should require authentication", async () => {
    const team = await (0, _factories.buildTeam)();
    const authenticationProviders = await team.getAuthenticationProviders();
    const res = await server.post("/api/authenticationProviders.info", {
      body: {
        id: authenticationProviders[0].id
      }
    });
    expect(res.status).toEqual(401);
  });
});
describe("#authenticationProviders.update", () => {
  it("should not allow admins to disable when last authentication provider", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildAdmin)({
      teamId: team.id
    });
    const authenticationProviders = await team.getAuthenticationProviders();
    const res = await server.post("/api/authenticationProviders.update", {
      body: {
        id: authenticationProviders[0].id,
        isEnabled: false,
        token: user.getJwtToken()
      }
    });
    expect(res.status).toEqual(400);
  });
  it("should allow admins to disable", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildAdmin)({
      teamId: team.id
    });
    await team.createAuthenticationProvider({
      name: "google",
      providerId: (0, _uuid.v4)()
    });
    const authenticationProviders = await team.getAuthenticationProviders();
    const res = await server.post("/api/authenticationProviders.update", {
      body: {
        id: authenticationProviders[0].id,
        isEnabled: false,
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toBe("slack");
    expect(body.data.isEnabled).toBe(false);
    expect(body.data.isConnected).toBe(true);
  });
  it("should require authorization", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)({
      teamId: team.id
    });
    const authenticationProviders = await team.getAuthenticationProviders();
    const res = await server.post("/api/authenticationProviders.update", {
      body: {
        id: authenticationProviders[0].id,
        isEnabled: false,
        token: user.getJwtToken()
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should require authentication", async () => {
    const team = await (0, _factories.buildTeam)();
    const authenticationProviders = await team.getAuthenticationProviders();
    const res = await server.post("/api/authenticationProviders.update", {
      body: {
        id: authenticationProviders[0].id,
        isEnabled: false
      }
    });
    expect(res.status).toEqual(401);
  });
});
describe("#authenticationProviders.list", () => {
  it("should return enabled and available auth providers", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)({
      teamId: team.id
    });
    const res = await server.post("/api/authenticationProviders.list", {
      body: {
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.authenticationProviders.length).toBe(2);
    expect(body.data.authenticationProviders[0].name).toBe("slack");
    expect(body.data.authenticationProviders[0].isEnabled).toBe(true);
    expect(body.data.authenticationProviders[0].isConnected).toBe(true);
    expect(body.data.authenticationProviders[1].name).toBe("google");
    expect(body.data.authenticationProviders[1].isEnabled).toBe(false);
    expect(body.data.authenticationProviders[1].isConnected).toBe(false);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/authenticationProviders.list");
    expect(res.status).toEqual(401);
  });
});