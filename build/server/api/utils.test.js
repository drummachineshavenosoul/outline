"use strict";

var _dateFns = require("date-fns");

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _app = _interopRequireDefault(require("../app"));

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
const server = new _fetchTestServer.default(_app.default.callback());
jest.mock("aws-sdk", () => {
  const mS3 = {
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  return {
    S3: jest.fn(() => mS3),
    Endpoint: jest.fn()
  };
});
beforeEach(() => (0, _support.flushdb)());
afterAll(() => server.close());
describe("#utils.gc", () => {
  it("should not destroy documents not deleted", async () => {
    await (0, _factories.buildDocument)({
      publishedAt: new Date()
    });
    const res = await server.post("/api/utils.gc", {
      body: {
        token: process.env.UTILS_SECRET
      }
    });
    expect(res.status).toEqual(200);
    expect(await _models.Document.unscoped().count({
      paranoid: false
    })).toEqual(1);
  });
  it("should not destroy documents deleted less than 30 days ago", async () => {
    await (0, _factories.buildDocument)({
      publishedAt: new Date(),
      deletedAt: (0, _dateFns.subDays)(new Date(), 25)
    });
    const res = await server.post("/api/utils.gc", {
      body: {
        token: process.env.UTILS_SECRET
      }
    });
    expect(res.status).toEqual(200);
    expect(await _models.Document.unscoped().count({
      paranoid: false
    })).toEqual(1);
  });
  it("should destroy documents deleted more than 30 days ago", async () => {
    await (0, _factories.buildDocument)({
      publishedAt: new Date(),
      deletedAt: (0, _dateFns.subDays)(new Date(), 60)
    });
    const res = await server.post("/api/utils.gc", {
      body: {
        token: process.env.UTILS_SECRET
      }
    });
    expect(res.status).toEqual(200);
    expect(await _models.Document.unscoped().count({
      paranoid: false
    })).toEqual(0);
  });
  it("should destroy draft documents deleted more than 30 days ago", async () => {
    await (0, _factories.buildDocument)({
      publishedAt: undefined,
      deletedAt: (0, _dateFns.subDays)(new Date(), 60)
    });
    const res = await server.post("/api/utils.gc", {
      body: {
        token: process.env.UTILS_SECRET
      }
    });
    expect(res.status).toEqual(200);
    expect(await _models.Document.unscoped().count({
      paranoid: false
    })).toEqual(0);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/utils.gc");
    expect(res.status).toEqual(401);
  });
});