"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = slugify;

var _slug = _interopRequireDefault(require("slug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_slug.default.defaults.mode = "rfc3986";

function slugify(text) {
  return (0, _slug.default)(text, {
    remove: /[.]/g
  });
}