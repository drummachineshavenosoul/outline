"use strict";

var _parseImages = _interopRequireDefault(require("./parseImages"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it("should not return non images", () => {
  expect((0, _parseImages.default)(`# Header`).length).toBe(0);
});
it("should return an array of images", () => {
  const result = (0, _parseImages.default)(`# Header
  
  ![internal](/attachments/image.png)
  `);
  expect(result.length).toBe(1);
  expect(result[0]).toBe("/attachments/image.png");
});
it("should not return non document links", () => {
  expect((0, _parseImages.default)(`[google](http://www.google.com)`).length).toBe(0);
});
it("should not return non document relative links", () => {
  expect((0, _parseImages.default)(`[relative](/developers)`).length).toBe(0);
});