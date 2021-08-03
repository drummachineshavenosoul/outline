"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

function present(group) {
  return {
    id: group.id,
    name: group.name,
    memberCount: group.groupMemberships.length,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  };
}