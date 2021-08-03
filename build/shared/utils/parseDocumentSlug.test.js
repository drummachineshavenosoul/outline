"use strict";

var _parseDocumentSlug = _interopRequireDefault(require("./parseDocumentSlug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("#parseDocumentSlug", function () {
  it("should work with fully qualified url", function () {
    expect((0, _parseDocumentSlug.default)("http://example.com/doc/my-doc-y4j4tR4UuV")).toEqual("my-doc-y4j4tR4UuV");
  });
  it("should work with subdomain qualified url", function () {
    expect((0, _parseDocumentSlug.default)("http://mywiki.getoutline.com/doc/my-doc-y4j4tR4UuV")).toEqual("my-doc-y4j4tR4UuV");
  });
  it("should work with path", function () {
    expect((0, _parseDocumentSlug.default)("/doc/my-doc-y4j4tR4UuV")).toEqual("my-doc-y4j4tR4UuV");
  });
});