"use strict";

var _path = _interopRequireDefault(require("path"));

var _file = _interopRequireDefault(require("formidable/lib/file"));

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

var _collectionImporter = _interopRequireDefault(require("./collectionImporter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock("../utils/s3");
beforeEach(() => (0, _support.flushdb)());
describe("collectionImporter", () => {
  const ip = "127.0.0.1";
  it("should import documents in outline format", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "outline.zip";
    const file = new _file.default({
      name,
      type: "application/zip",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    const response = await (0, _collectionImporter.default)({
      type: "outline",
      user,
      file,
      ip
    });
    expect(response.collections.length).toEqual(1);
    expect(response.documents.length).toEqual(8);
    expect(response.attachments.length).toEqual(6);
    expect(await _models.Collection.count()).toEqual(1);
    expect(await _models.Document.count()).toEqual(8);
    expect(await _models.Attachment.count()).toEqual(6);
  });
  it("should throw an error with corrupt zip", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "corrupt.zip";
    const file = new _file.default({
      name,
      type: "application/zip",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    let error;

    try {
      await (0, _collectionImporter.default)({
        type: "outline",
        user,
        file,
        ip
      });
    } catch (err) {
      error = err;
    }

    expect(error && error.message).toBeTruthy();
  });
  it("should throw an error with empty zip", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "empty.zip";
    const file = new _file.default({
      name,
      type: "application/zip",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    let error;

    try {
      await (0, _collectionImporter.default)({
        type: "outline",
        user,
        file,
        ip
      });
    } catch (err) {
      error = err;
    }

    expect(error && error.message).toBe("Uploaded file does not contain importable documents");
  });
});