"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _models = require("../models");

var _default = membership => {
  return {
    id: `${membership.groupId}-${membership.collectionId}`,
    groupId: membership.groupId,
    collectionId: membership.collectionId,
    permission: membership.permission
  };
};

exports.default = _default;