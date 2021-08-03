"use strict";

require("core-js/modules/es.regexp.constructor");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.regexp.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateIndexCharacters = void 0;

var validateIndexCharacters = function validateIndexCharacters(index) {
  return new RegExp("^[\x20-\x7E]+$").test(index);
};

exports.validateIndexCharacters = validateIndexCharacters;