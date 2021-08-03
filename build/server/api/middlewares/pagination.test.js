"use strict";

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _app = _interopRequireDefault(require("../../app"));

var _support = require("../../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
const server = new _fetchTestServer.default(_app.default.callback());
beforeEach(() => (0, _support.flushdb)());
afterAll(() => server.close());
describe("#pagination", () => {
  it("should allow offset and limit", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/users.list", {
      body: {
        token: user.getJwtToken(),
        limit: 1,
        offset: 1
      }
    });
    expect(res.status).toEqual(200);
  });
  it("should not allow negative limit", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/users.list", {
      body: {
        token: user.getJwtToken(),
        limit: -1
      }
    });
    expect(res.status).toEqual(400);
  });
  it("should not allow non-integer limit", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/users.list", {
      body: {
        token: user.getJwtToken(),
        limit: "blah"
      }
    });
    expect(res.status).toEqual(400);
  });
  it("should not allow negative offset", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/users.list", {
      body: {
        token: user.getJwtToken(),
        offset: -1
      }
    });
    expect(res.status).toEqual(400);
  });
  it("should not allow non-integer offset", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/users.list", {
      body: {
        token: user.getJwtToken(),
        offset: "blah"
      }
    });
    expect(res.status).toEqual(400);
  });
});