"use strict";

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _app = _interopRequireDefault(require("../../app"));

var _mailer = _interopRequireDefault(require("../../mailer"));

var _factories = require("../../test/factories");

var _support = require("../../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const server = new _fetchTestServer.default(_app.default.callback());
jest.mock("../../mailer");
beforeEach(async () => {
  await (0, _support.flushdb)(); // $FlowFixMe – does not understand Jest mocks

  _mailer.default.signin.mockReset();
});
afterAll(() => server.close());
describe("email", () => {
  it("should require email param", async () => {
    const res = await server.post("/auth/email", {
      body: {}
    });
    const body = await res.json();
    expect(res.status).toEqual(400);
    expect(body.error).toEqual("validation_error");
    expect(body.ok).toEqual(false);
  });
  it("should respond with redirect location when user is SSO enabled", async () => {
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/auth/email", {
      body: {
        email: user.email
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.redirect).toMatch("slack");
    expect(_mailer.default.signin).not.toHaveBeenCalled();
  });
  it("should respond with redirect location when user is SSO enabled on another subdomain", async () => {
    process.env.URL = "http://localoutline.com";
    process.env.SUBDOMAINS_ENABLED = "true";
    const user = await (0, _factories.buildUser)();
    await (0, _factories.buildTeam)({
      subdomain: "example"
    });
    const res = await server.post("/auth/email", {
      body: {
        email: user.email
      },
      headers: {
        host: "example.localoutline.com"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.redirect).toMatch("slack");
    expect(_mailer.default.signin).not.toHaveBeenCalled();
  });
  it("should respond with success when user is not SSO enabled", async () => {
    const user = await (0, _factories.buildGuestUser)();
    const res = await server.post("/auth/email", {
      body: {
        email: user.email
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.success).toEqual(true);
    expect(_mailer.default.signin).toHaveBeenCalled();
  });
  it("should respond with success regardless of whether successful to prevent crawling email logins", async () => {
    const res = await server.post("/auth/email", {
      body: {
        email: "user@example.com"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.success).toEqual(true);
    expect(_mailer.default.signin).not.toHaveBeenCalled();
  });
  describe("with multiple users matching email", () => {
    it("should default to current subdomain with SSO", async () => {
      process.env.URL = "http://localoutline.com";
      process.env.SUBDOMAINS_ENABLED = "true";
      const email = "sso-user@example.org";
      const team = await (0, _factories.buildTeam)({
        subdomain: "example"
      });
      await (0, _factories.buildGuestUser)({
        email
      });
      await (0, _factories.buildUser)({
        email,
        teamId: team.id
      });
      const res = await server.post("/auth/email", {
        body: {
          email
        },
        headers: {
          host: "example.localoutline.com"
        }
      });
      const body = await res.json();
      expect(res.status).toEqual(200);
      expect(body.redirect).toMatch("slack");
      expect(_mailer.default.signin).not.toHaveBeenCalled();
    });
    it("should default to current subdomain with guest email", async () => {
      process.env.URL = "http://localoutline.com";
      process.env.SUBDOMAINS_ENABLED = "true";
      const email = "guest-user@example.org";
      const team = await (0, _factories.buildTeam)({
        subdomain: "example"
      });
      await (0, _factories.buildUser)({
        email
      });
      await (0, _factories.buildGuestUser)({
        email,
        teamId: team.id
      });
      const res = await server.post("/auth/email", {
        body: {
          email
        },
        headers: {
          host: "example.localoutline.com"
        }
      });
      const body = await res.json();
      expect(res.status).toEqual(200);
      expect(body.success).toEqual(true);
      expect(_mailer.default.signin).toHaveBeenCalled();
    });
    it("should default to custom domain with SSO", async () => {
      const email = "sso-user-2@example.org";
      const team = await (0, _factories.buildTeam)({
        domain: "docs.mycompany.com"
      });
      await (0, _factories.buildGuestUser)({
        email
      });
      await (0, _factories.buildUser)({
        email,
        teamId: team.id
      });
      const res = await server.post("/auth/email", {
        body: {
          email
        },
        headers: {
          host: "docs.mycompany.com"
        }
      });
      const body = await res.json();
      expect(res.status).toEqual(200);
      expect(body.redirect).toMatch("slack");
      expect(_mailer.default.signin).not.toHaveBeenCalled();
    });
    it("should default to custom domain with guest email", async () => {
      const email = "guest-user-2@example.org";
      const team = await (0, _factories.buildTeam)({
        domain: "docs.mycompany.com"
      });
      await (0, _factories.buildUser)({
        email
      });
      await (0, _factories.buildGuestUser)({
        email,
        teamId: team.id
      });
      const res = await server.post("/auth/email", {
        body: {
          email
        },
        headers: {
          host: "docs.mycompany.com"
        }
      });
      const body = await res.json();
      expect(res.status).toEqual(200);
      expect(body.success).toEqual(true);
      expect(_mailer.default.signin).toHaveBeenCalled();
    });
  });
});