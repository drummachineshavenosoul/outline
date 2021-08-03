"use strict";

var _parseDocumentIds = _interopRequireDefault(require("./parseDocumentIds"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it("should not return non links", () => {
  expect((0, _parseDocumentIds.default)(`# Header`).length).toBe(0);
});
it("should return an array of document ids", () => {
  const result = (0, _parseDocumentIds.default)(`# Header
  
  [internal](/doc/test-456733)
  `);
  expect(result.length).toBe(1);
  expect(result[0]).toBe("test-456733");
});
it("should not return duplicate document ids", () => {
  expect((0, _parseDocumentIds.default)(`# Header`).length).toBe(0);
  const result = (0, _parseDocumentIds.default)(`# Header
  
  [internal](/doc/test-456733)

  [another link to the same doc](/doc/test-456733)
  `);
  expect(result.length).toBe(1);
  expect(result[0]).toBe("test-456733");
});
it("should not return non document links", () => {
  expect((0, _parseDocumentIds.default)(`[google](http://www.google.com)`).length).toBe(0);
});
it("should not return non document relative links", () => {
  expect((0, _parseDocumentIds.default)(`[relative](/developers)`).length).toBe(0);
});