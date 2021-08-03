"use strict";

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var unescape = function unescape(text) {
  return text.replace(/\\([\\`*{}[\]()#+\-.!_>])/g, "$1").replace(/\n\\\n/g, "\n\n");
};

var _default = unescape;
exports.default = _default;