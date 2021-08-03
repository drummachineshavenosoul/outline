"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateColorHex = void 0;

var validateColorHex = function validateColorHex(color) {
  return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
};

exports.validateColorHex = validateColorHex;