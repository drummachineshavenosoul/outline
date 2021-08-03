"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

function present(setting) {
  return {
    id: setting.id,
    event: setting.event
  };
}