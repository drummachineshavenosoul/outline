"use strict";

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

var _backfillRevisions = _interopRequireDefault(require("./20210716000000-backfill-revisions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(() => (0, _support.flushdb)());
describe("#work", () => {
  it("should create events for revisions", async () => {
    const document = await (0, _factories.buildDocument)();
    const revision = await _models.Revision.createFromDocument(document);
    await (0, _backfillRevisions.default)();
    const event = await _models.Event.findOne();
    expect(event.name).toEqual("revisions.create");
    expect(event.modelId).toEqual(revision.id);
    expect(event.documentId).toEqual(document.id);
    expect(event.teamId).toEqual(document.teamId);
    expect(event.createdAt).toEqual(revision.createdAt);
  });
  it("should create events for revisions of deleted documents", async () => {
    const document = await (0, _factories.buildDocument)();
    const revision = await _models.Revision.createFromDocument(document);
    await document.destroy();
    await (0, _backfillRevisions.default)();
    const event = await _models.Event.findOne();
    expect(event.name).toEqual("revisions.create");
    expect(event.modelId).toEqual(revision.id);
    expect(event.documentId).toEqual(document.id);
    expect(event.teamId).toEqual(document.teamId);
    expect(event.createdAt).toEqual(revision.createdAt);
  });
  it("should be idempotent", async () => {
    const document = await (0, _factories.buildDocument)();
    await _models.Revision.createFromDocument(document);
    await (0, _backfillRevisions.default)();
    await (0, _backfillRevisions.default)();
    const count = await _models.Event.count();
    expect(count).toEqual(1);
  });
});