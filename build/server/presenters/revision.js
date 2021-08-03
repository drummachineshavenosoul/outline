"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

var _user = _interopRequireDefault(require("./user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function present(revision) {
  await revision.migrateVersion();
  return {
    id: revision.id,
    documentId: revision.documentId,
    title: revision.title,
    text: revision.text,
    createdAt: revision.createdAt,
    createdBy: (0, _user.default)(revision.user)
  };
}