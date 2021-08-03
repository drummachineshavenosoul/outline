"use strict";

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

/* eslint-disable flowtype/require-valid-file-annotation */
beforeEach(() => (0, _support.flushdb)());
beforeEach(jest.resetAllMocks);
describe("#findLatest", () => {
  test("should return latest revision", async () => {
    const document = await (0, _factories.buildDocument)({
      title: "Title",
      text: "Content"
    });
    await _models.Revision.createFromDocument(document);
    document.title = "Changed 1";
    await document.save();
    await _models.Revision.createFromDocument(document);
    document.title = "Changed 2";
    await document.save();
    await _models.Revision.createFromDocument(document);
    const revision = await _models.Revision.findLatest(document.id);
    expect(revision.title).toBe("Changed 2");
    expect(revision.text).toBe("Content");
  });
});