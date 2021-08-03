"use strict";

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

var _revisions = _interopRequireDefault(require("./revisions"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
const Revisions = new _revisions.default();
beforeEach(() => (0, _support.flushdb)());
beforeEach(jest.resetAllMocks);
describe("documents.publish", () => {
  test("should create a revision", async () => {
    const document = await (0, _factories.buildDocument)();
    await Revisions.on({
      name: "documents.publish",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    const amount = await _models.Revision.count({
      where: {
        documentId: document.id
      }
    });
    expect(amount).toBe(1);
  });
});
describe("documents.update.debounced", () => {
  test("should create a revision", async () => {
    const document = await (0, _factories.buildDocument)();
    await Revisions.on({
      name: "documents.update.debounced",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    const amount = await _models.Revision.count({
      where: {
        documentId: document.id
      }
    });
    expect(amount).toBe(1);
  });
  test("should not create a revision if identical to previous", async () => {
    const document = await (0, _factories.buildDocument)();
    await _models.Revision.createFromDocument(document);
    await Revisions.on({
      name: "documents.update.debounced",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    const amount = await _models.Revision.count({
      where: {
        documentId: document.id
      }
    });
    expect(amount).toBe(1);
  });
});