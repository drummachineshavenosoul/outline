"use strict";

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _app = _interopRequireDefault(require("../app"));

var _support = require("../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
const server = new _fetchTestServer.default(_app.default.callback());
beforeEach(() => (0, _support.flushdb)());
afterAll(() => server.close());
describe("#team.update", () => {
  it("should update team details", async () => {
    const {
      admin
    } = await (0, _support.seed)();
    const res = await server.post("/api/team.update", {
      body: {
        token: admin.getJwtToken(),
        name: "New name"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toEqual("New name");
  });
  it("should allow identical team details", async () => {
    const {
      admin,
      team
    } = await (0, _support.seed)();
    const res = await server.post("/api/team.update", {
      body: {
        token: admin.getJwtToken(),
        name: team.name
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toEqual(team.name);
  });
  it("should require admin", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/team.update", {
      body: {
        token: user.getJwtToken(),
        name: "New name"
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should require authentication", async () => {
    await (0, _support.seed)();
    const res = await server.post("/api/team.update");
    expect(res.status).toEqual(401);
  });
});