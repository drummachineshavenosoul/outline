"use strict";

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _app = _interopRequireDefault(require("../app"));

var _factories = require("../test/factories");

var _support = require("../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
const server = new _fetchTestServer.default(_app.default.callback());
beforeEach(() => (0, _support.flushdb)());
afterAll(() => server.close());
describe("#auth.info", () => {
  it("should return current authentication", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)({
      teamId: team.id
    });
    const res = await server.post("/api/auth.info", {
      body: {
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.user.name).toBe(user.name);
    expect(body.data.team.name).toBe(team.name);
  });
  it("should require the team to not be deleted", async () => {
    const team = await (0, _factories.buildTeam)();
    const user = await (0, _factories.buildUser)({
      teamId: team.id
    });
    await team.destroy();
    const res = await server.post("/api/auth.info", {
      body: {
        token: user.getJwtToken()
      }
    });
    expect(res.status).toEqual(401);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/auth.info");
    expect(res.status).toEqual(401);
  });
});
describe("#auth.config", () => {
  it("should return available SSO providers", async () => {
    const res = await server.post("/api/auth.config");
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.providers.length).toBe(2);
    expect(body.data.providers[0].name).toBe("Slack");
    expect(body.data.providers[1].name).toBe("Google");
  });
  it("should return available providers for team subdomain", async () => {
    process.env.URL = "http://localoutline.com";
    await (0, _factories.buildTeam)({
      guestSignin: false,
      subdomain: "example",
      authenticationProviders: [{
        name: "slack",
        providerId: "123"
      }]
    });
    const res = await server.post("/api/auth.config", {
      headers: {
        host: `example.localoutline.com`
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.providers.length).toBe(1);
    expect(body.data.providers[0].name).toBe("Slack");
  });
  it("should return available providers for team custom domain", async () => {
    await (0, _factories.buildTeam)({
      guestSignin: false,
      domain: "docs.mycompany.com",
      authenticationProviders: [{
        name: "slack",
        providerId: "123"
      }]
    });
    const res = await server.post("/api/auth.config", {
      headers: {
        host: "docs.mycompany.com"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.providers.length).toBe(1);
    expect(body.data.providers[0].name).toBe("Slack");
  });
  it("should return email provider for team when guest signin enabled", async () => {
    process.env.URL = "http://localoutline.com";
    await (0, _factories.buildTeam)({
      guestSignin: true,
      subdomain: "example",
      authenticationProviders: [{
        name: "slack",
        providerId: "123"
      }]
    });
    const res = await server.post("/api/auth.config", {
      headers: {
        host: "example.localoutline.com"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.providers.length).toBe(2);
    expect(body.data.providers[0].name).toBe("Slack");
    expect(body.data.providers[1].name).toBe("Email");
  });
  it("should not return provider when disabled", async () => {
    process.env.URL = "http://localoutline.com";
    await (0, _factories.buildTeam)({
      guestSignin: false,
      subdomain: "example",
      authenticationProviders: [{
        name: "slack",
        providerId: "123",
        enabled: false
      }]
    });
    const res = await server.post("/api/auth.config", {
      headers: {
        host: "example.localoutline.com"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.providers.length).toBe(0);
  });
  describe("self hosted", () => {
    it("should return available providers for team", async () => {
      process.env.DEPLOYMENT = "";
      await (0, _factories.buildTeam)({
        guestSignin: false,
        authenticationProviders: [{
          name: "slack",
          providerId: "123"
        }]
      });
      const res = await server.post("/api/auth.config");
      const body = await res.json();
      expect(res.status).toEqual(200);
      expect(body.data.providers.length).toBe(1);
      expect(body.data.providers[0].name).toBe("Slack");
    });
    it("should return email provider for team when guest signin enabled", async () => {
      process.env.DEPLOYMENT = "";
      await (0, _factories.buildTeam)({
        guestSignin: true,
        authenticationProviders: [{
          name: "slack",
          providerId: "123"
        }]
      });
      const res = await server.post("/api/auth.config");
      const body = await res.json();
      expect(res.status).toEqual(200);
      expect(body.data.providers.length).toBe(2);
      expect(body.data.providers[0].name).toBe("Slack");
      expect(body.data.providers[1].name).toBe("Email");
    });
  });
});