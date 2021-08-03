"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

function present(key) {
  return {
    id: key.id,
    name: key.name,
    secret: key.secret
  };
}