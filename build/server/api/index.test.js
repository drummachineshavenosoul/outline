"use strict";

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _app = _interopRequireDefault(require("../app"));

var _support = require("../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
const server = new _fetchTestServer.default(_app.default.callback());
beforeEach(() => (0, _support.flushdb)());
afterAll(() => server.close());
describe("POST unknown endpoint", () => {
  it("should be not found", async () => {
    const res = await server.post("/api/blah");
    expect(res.status).toEqual(404);
  });
});
describe("GET unknown endpoint", () => {
  it("should be not found", async () => {
    const res = await server.get("/api/blah");
    expect(res.status).toEqual(404);
  });
});