"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

function present(authenticationProvider) {
  return {
    id: authenticationProvider.id,
    name: authenticationProvider.name,
    createdAt: authenticationProvider.createdAt,
    isEnabled: authenticationProvider.enabled,
    isConnected: true
  };
}