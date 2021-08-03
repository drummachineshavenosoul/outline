"use strict";

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _app = _interopRequireDefault(require("../app"));

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
const server = new _fetchTestServer.default(_app.default.callback());
beforeEach(() => (0, _support.flushdb)());
afterAll(() => server.close());
describe("#revisions.info", () => {
  it("should return a document revision", async () => {
    const {
      user,
      document
    } = await (0, _support.seed)();
    const revision = await _models.Revision.createFromDocument(document);
    const res = await server.post("/api/revisions.info", {
      body: {
        token: user.getJwtToken(),
        id: revision.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.id).not.toEqual(document.id);
    expect(body.data.title).toEqual(document.title);
  });
  it("should require authorization", async () => {
    const document = await (0, _factories.buildDocument)();
    const revision = await _models.Revision.createFromDocument(document);
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/revisions.info", {
      body: {
        token: user.getJwtToken(),
        id: revision.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#revisions.list", () => {
  it("should return a document's revisions", async () => {
    const {
      user,
      document
    } = await (0, _support.seed)();
    await _models.Revision.createFromDocument(document);
    const res = await server.post("/api/revisions.list", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
    expect(body.data[0].id).not.toEqual(document.id);
    expect(body.data[0].title).toEqual(document.title);
  });
  it("should not return revisions for document in collection not a member of", async () => {
    const {
      user,
      document,
      collection
    } = await (0, _support.seed)();
    await _models.Revision.createFromDocument(document);
    collection.permission = null;
    await collection.save();
    const res = await server.post("/api/revisions.list", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should require authorization", async () => {
    const document = await (0, _factories.buildDocument)();
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/revisions.list", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    expect(res.status).toEqual(403);
  });
});