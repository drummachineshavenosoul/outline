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
describe("#views.list", () => {
  it("should return views for a document", async () => {
    const {
      user,
      document
    } = await (0, _support.seed)();
    await _models.View.increment({
      documentId: document.id,
      userId: user.id
    });
    const res = await server.post("/api/views.list", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data[0].count).toBe(1);
    expect(body.data[0].user.name).toBe(user.name);
  });
  it("should return views for a document in read-only collection", async () => {
    const {
      user,
      document,
      collection
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read"
    });
    await _models.View.increment({
      documentId: document.id,
      userId: user.id
    });
    const res = await server.post("/api/views.list", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data[0].count).toBe(1);
    expect(body.data[0].user.name).toBe(user.name);
  });
  it("should require authentication", async () => {
    const {
      document
    } = await (0, _support.seed)();
    const res = await server.post("/api/views.list", {
      body: {
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const {
      document
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/views.list", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#views.create", () => {
  it("should allow creating a view record for document", async () => {
    const {
      user,
      document
    } = await (0, _support.seed)();
    const res = await server.post("/api/views.create", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.count).toBe(1);
  });
  it("should allow creating a view record for document in read-only collection", async () => {
    const {
      user,
      document,
      collection
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read"
    });
    const res = await server.post("/api/views.create", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.count).toBe(1);
  });
  it("should require authentication", async () => {
    const {
      document
    } = await (0, _support.seed)();
    const res = await server.post("/api/views.create", {
      body: {
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const {
      document
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/views.create", {
      body: {
        token: user.getJwtToken(),
        documentId: document.id
      }
    });
    expect(res.status).toEqual(403);
  });
});