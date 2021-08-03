"use strict";

var _path = _interopRequireDefault(require("path"));

var _file = _interopRequireDefault(require("formidable/lib/file"));

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

var _documentImporter = _interopRequireDefault(require("./documentImporter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock("../utils/s3");
beforeEach(() => (0, _support.flushdb)());
describe("documentImporter", () => {
  const ip = "127.0.0.1";
  it("should convert Word Document to markdown", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "images.docx";
    const file = new _file.default({
      name,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    const response = await (0, _documentImporter.default)({
      user,
      file,
      ip
    });
    const attachments = await _models.Attachment.count();
    expect(attachments).toEqual(1);
    expect(response.text).toContain("This is a test document for images");
    expect(response.text).toContain("![](/api/attachments.redirect?id=");
    expect(response.title).toEqual("images");
  });
  it("should convert Word Document to markdown for application/octet-stream mimetype", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "images.docx";
    const file = new _file.default({
      name,
      type: "application/octet-stream",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    const response = await (0, _documentImporter.default)({
      user,
      file,
      ip
    });
    const attachments = await _models.Attachment.count();
    expect(attachments).toEqual(1);
    expect(response.text).toContain("This is a test document for images");
    expect(response.text).toContain("![](/api/attachments.redirect?id=");
    expect(response.title).toEqual("images");
  });
  it("should error when a file with application/octet-stream mimetype doesn't have .docx extension", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "normal.docx.txt";
    const file = new _file.default({
      name,
      type: "application/octet-stream",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    let error;

    try {
      await (0, _documentImporter.default)({
        user,
        file,
        ip
      });
    } catch (err) {
      error = err.message;
    }

    expect(error).toEqual("File type application/octet-stream not supported");
  });
  it("should convert Word Document on Windows to markdown", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "images.docx";
    const file = new _file.default({
      name,
      type: "application/octet-stream",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    const response = await (0, _documentImporter.default)({
      user,
      file,
      ip
    });
    const attachments = await _models.Attachment.count();
    expect(attachments).toEqual(1);
    expect(response.text).toContain("This is a test document for images");
    expect(response.text).toContain("![](/api/attachments.redirect?id=");
    expect(response.title).toEqual("images");
  });
  it("should convert HTML Document to markdown", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "webpage.html";
    const file = new _file.default({
      name,
      type: "text/html",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    const response = await (0, _documentImporter.default)({
      user,
      file,
      ip
    });
    expect(response.text).toContain("Text paragraph");
    expect(response.title).toEqual("Heading 1");
  });
  it("should convert Confluence Word output to markdown", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "confluence.doc";
    const file = new _file.default({
      name,
      type: "application/msword",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    const response = await (0, _documentImporter.default)({
      user,
      file,
      ip
    });
    expect(response.text).toContain("this is a test document");
    expect(response.title).toEqual("Heading 1");
  });
  it("should load markdown", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "markdown.md";
    const file = new _file.default({
      name,
      type: "text/plain",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    const response = await (0, _documentImporter.default)({
      user,
      file,
      ip
    });
    expect(response.text).toContain("This is a test paragraph");
    expect(response.title).toEqual("Heading 1");
  });
  it("should handle encoded slashes", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "this %2F and %2F this.md";
    const file = new _file.default({
      name,
      type: "text/plain",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", "empty.md")
    });
    const response = await (0, _documentImporter.default)({
      user,
      file,
      ip
    });
    expect(response.text).toContain("");
    expect(response.title).toEqual("this / and / this");
  });
  it("should fallback to extension if mimetype unknown", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "markdown.md";
    const file = new _file.default({
      name,
      type: "application/lol",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    const response = await (0, _documentImporter.default)({
      user,
      file,
      ip
    });
    expect(response.text).toContain("This is a test paragraph");
    expect(response.title).toEqual("Heading 1");
  });
  it("should error with unknown file type", async () => {
    const user = await (0, _factories.buildUser)();
    const name = "files.zip";
    const file = new _file.default({
      name,
      type: "executable/zip",
      path: _path.default.resolve(__dirname, "..", "test", "fixtures", name)
    });
    let error;

    try {
      await (0, _documentImporter.default)({
        user,
        file,
        ip
      });
    } catch (err) {
      error = err.message;
    }

    expect(error).toEqual("File type executable/zip not supported");
  });
});