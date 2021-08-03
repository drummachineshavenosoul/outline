"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _models = require("../models");

var _ = require(".");

var _default = membership => {
  return {
    id: `${membership.userId}-${membership.groupId}`,
    userId: membership.userId,
    groupId: membership.groupId,
    user: (0, _.presentUser)(membership.user)
  };
};

exports.default = _default;