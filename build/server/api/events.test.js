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
describe("#events.list", () => {
  it("should only return activity events", async () => {
    const {
      user,
      admin,
      document,
      collection
    } = await (0, _support.seed)(); // audit event

    await (0, _factories.buildEvent)({
      name: "users.promote",
      teamId: user.teamId,
      actorId: admin.id,
      userId: user.id
    }); // event viewable in activity stream

    const event = await (0, _factories.buildEvent)({
      name: "documents.publish",
      collectionId: collection.id,
      documentId: document.id,
      teamId: user.teamId,
      actorId: admin.id
    });
    const res = await server.post("/api/events.list", {
      body: {
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
    expect(body.data[0].id).toEqual(event.id);
  });
  it("should return audit events", async () => {
    const {
      user,
      admin,
      document,
      collection
    } = await (0, _support.seed)(); // audit event

    const auditEvent = await (0, _factories.buildEvent)({
      name: "users.promote",
      teamId: user.teamId,
      actorId: admin.id,
      userId: user.id
    }); // event viewable in activity stream

    const event = await (0, _factories.buildEvent)({
      name: "documents.publish",
      collectionId: collection.id,
      documentId: document.id,
      teamId: user.teamId,
      actorId: admin.id
    });
    const res = await server.post("/api/events.list", {
      body: {
        token: admin.getJwtToken(),
        auditLog: true
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(2);
    expect(body.data[0].id).toEqual(event.id);
    expect(body.data[1].id).toEqual(auditEvent.id);
  });
  it("should allow filtering by actorId", async () => {
    const {
      user,
      admin,
      document,
      collection
    } = await (0, _support.seed)(); // audit event

    const auditEvent = await (0, _factories.buildEvent)({
      name: "users.promote",
      teamId: user.teamId,
      actorId: admin.id,
      userId: user.id
    }); // event viewable in activity stream

    await (0, _factories.buildEvent)({
      name: "documents.publish",
      collectionId: collection.id,
      documentId: document.id,
      teamId: user.teamId,
      actorId: user.id
    });
    const res = await server.post("/api/events.list", {
      body: {
        token: admin.getJwtToken(),
        auditLog: true,
        actorId: admin.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
    expect(body.data[0].id).toEqual(auditEvent.id);
  });
  it("should allow filtering by documentId", async () => {
    const {
      user,
      admin,
      document,
      collection
    } = await (0, _support.seed)();
    const event = await (0, _factories.buildEvent)({
      name: "documents.publish",
      collectionId: collection.id,
      documentId: document.id,
      teamId: user.teamId,
      actorId: user.id
    });
    const res = await server.post("/api/events.list", {
      body: {
        token: admin.getJwtToken(),
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
    expect(body.data[0].id).toEqual(event.id);
  });
  it("should not return events for documentId without authorization", async () => {
    const {
      user,
      document,
      collection
    } = await (0, _support.seed)();
    const actor = await (0, _factories.buildUser)();
    await (0, _factories.buildEvent)({
      name: "documents.publish",
      collectionId: collection.id,
      documentId: document.id,
      teamId: user.teamId,
      actorId: user.id
    });
    const res = await server.post("/api/events.list", {
      body: {
        token: actor.getJwtToken(),
        documentId: document.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(0);
  });
  it("should allow filtering by event name", async () => {
    const {
      user,
      admin,
      document,
      collection
    } = await (0, _support.seed)(); // audit event

    await (0, _factories.buildEvent)({
      name: "users.promote",
      teamId: user.teamId,
      actorId: admin.id,
      userId: user.id
    }); // event viewable in activity stream

    const event = await (0, _factories.buildEvent)({
      name: "documents.publish",
      collectionId: collection.id,
      documentId: document.id,
      teamId: user.teamId,
      actorId: user.id
    });
    const res = await server.post("/api/events.list", {
      body: {
        token: user.getJwtToken(),
        name: "documents.publish"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
    expect(body.data[0].id).toEqual(event.id);
  });
  it("should return events with deleted actors", async () => {
    const {
      user,
      admin,
      document,
      collection
    } = await (0, _support.seed)(); // event viewable in activity stream

    const event = await (0, _factories.buildEvent)({
      name: "documents.publish",
      collectionId: collection.id,
      documentId: document.id,
      teamId: user.teamId,
      actorId: user.id
    });
    await user.destroy();
    const res = await server.post("/api/events.list", {
      body: {
        token: admin.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
    expect(body.data[0].id).toEqual(event.id);
  });
  it("should require authorization for audit events", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/events.list", {
      body: {
        token: user.getJwtToken(),
        auditLog: true
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/events.list");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
});