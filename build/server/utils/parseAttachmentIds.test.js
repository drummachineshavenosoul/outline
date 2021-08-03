"use strict";

var _globals = require("@jest/globals");

var _uuid = require("uuid");

var _parseAttachmentIds = _interopRequireDefault(require("./parseAttachmentIds"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it("should return an empty array with no matches", () => {
  (0, _globals.expect)((0, _parseAttachmentIds.default)(`some random text`).length).toBe(0);
});
it("should not return orphaned UUID's", () => {
  const uuid = (0, _uuid.v4)();
  (0, _globals.expect)((0, _parseAttachmentIds.default)(`some random text with a uuid ${uuid}

![caption](/images/${uuid}.png)`).length).toBe(0);
});
it("should parse attachment ID from markdown", () => {
  const uuid = (0, _uuid.v4)();
  const results = (0, _parseAttachmentIds.default)(`![caption text](/api/attachments.redirect?id=${uuid})`);
  (0, _globals.expect)(results.length).toBe(1);
  (0, _globals.expect)(results[0]).toBe(uuid);
});
it("should parse attachment ID from markdown with additional query params", () => {
  const uuid = (0, _uuid.v4)();
  const results = (0, _parseAttachmentIds.default)(`![caption text](/api/attachments.redirect?id=${uuid}&size=2)`);
  (0, _globals.expect)(results.length).toBe(1);
  (0, _globals.expect)(results[0]).toBe(uuid);
});
it("should parse attachment ID from markdown with fully qualified url", () => {
  const uuid = (0, _uuid.v4)();
  const results = (0, _parseAttachmentIds.default)(`![caption text](${process.env.URL}/api/attachments.redirect?id=${uuid})`);
  (0, _globals.expect)(process.env.URL).toBeTruthy();
  (0, _globals.expect)(results.length).toBe(1);
  (0, _globals.expect)(results[0]).toBe(uuid);
});
it("should parse attachment ID from markdown with title", () => {
  const uuid = (0, _uuid.v4)();
  const results = (0, _parseAttachmentIds.default)(`![caption text](/api/attachments.redirect?id=${uuid} "align-left")`);
  (0, _globals.expect)(results.length).toBe(1);
  (0, _globals.expect)(results[0]).toBe(uuid);
});
it("should parse multiple attachment IDs from markdown", () => {
  const uuid = (0, _uuid.v4)();
  const uuid2 = (0, _uuid.v4)();
  const results = (0, _parseAttachmentIds.default)(`![caption text](/api/attachments.redirect?id=${uuid})

some text

![another caption](/api/attachments.redirect?id=${uuid2})`);
  (0, _globals.expect)(results.length).toBe(2);
  (0, _globals.expect)(results[0]).toBe(uuid);
  (0, _globals.expect)(results[1]).toBe(uuid2);
});
it("should parse attachment ID from html", () => {
  const uuid = (0, _uuid.v4)();
  const results = (0, _parseAttachmentIds.default)(`<img src="/api/attachments.redirect?id=${uuid}" />`);
  (0, _globals.expect)(results.length).toBe(1);
  (0, _globals.expect)(results[0]).toBe(uuid);
});
it("should parse attachment ID from html with fully qualified url", () => {
  const uuid = (0, _uuid.v4)();
  const results = (0, _parseAttachmentIds.default)(`<img src="${process.env.URL}/api/attachments.redirect?id=${uuid}" />`);
  (0, _globals.expect)(process.env.URL).toBeTruthy();
  (0, _globals.expect)(results.length).toBe(1);
  (0, _globals.expect)(results[0]).toBe(uuid);
});