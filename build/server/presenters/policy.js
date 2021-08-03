"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

function present(user, objects) {
  const {
    serialize
  } = require("../policies");

  return objects.map(object => ({
    id: object.id,
    abilities: serialize(user, object)
  }));
}