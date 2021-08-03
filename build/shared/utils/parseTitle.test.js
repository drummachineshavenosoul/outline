"use strict";

var _parseTitle = _interopRequireDefault(require("./parseTitle"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
it("should trim the title", function () {
  expect((0, _parseTitle.default)("#    Lots of space     ").title).toBe("Lots of space");
});
it("should extract first title", function () {
  expect((0, _parseTitle.default)("# Title one\n# Title two").title).toBe("Title one");
});
it("should remove escape characters", function () {
  expect((0, _parseTitle.default)("# Thing \\- one").title).toBe("Thing - one");
  expect((0, _parseTitle.default)("# \\[wip\\] Title").title).toBe("[wip] Title");
  expect((0, _parseTitle.default)("# \\> Title").title).toBe("> Title");
});
it("should parse emoji if first character", function () {
  var parsed = (0, _parseTitle.default)("# \uD83D\uDE00 Title");
  expect(parsed.title).toBe("😀 Title");
  expect(parsed.emoji).toBe("😀");
});
it("should not parse emoji if not first character", function () {
  var parsed = (0, _parseTitle.default)("# Title \uD83C\uDF08");
  expect(parsed.title).toBe("Title 🌈");
  expect(parsed.emoji).toBe(undefined);
});