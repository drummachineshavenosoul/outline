"use strict";

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

var _revisionCreator = _interopRequireDefault(require("./revisionCreator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(() => (0, _support.flushdb)());
describe("revisionCreator", () => {
  const ip = "127.0.0.1";
  it("should create revision model from document", async () => {
    const user = await (0, _factories.buildUser)();
    const document = await (0, _factories.buildDocument)({
      userId: user.id,
      teamId: user.teamId
    });
    const revision = await (0, _revisionCreator.default)({
      document,
      user,
      ip
    });
    const event = await _models.Event.findOne();
    expect(revision.documentId).toEqual(document.id);
    expect(revision.userId).toEqual(user.id);
    expect(event.name).toEqual("revisions.create");
    expect(event.modelId).toEqual(revision.id);
    expect(event.createdAt).toEqual(document.updatedAt);
  });
});