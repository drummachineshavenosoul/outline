"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

var _ = require(".");

function present(share, isAdmin = false) {
  let data = {
    id: share.id,
    documentId: share.documentId,
    documentTitle: share.document.title,
    documentUrl: share.document.url,
    published: share.published,
    url: `${share.team.url}/share/${share.id}`,
    createdBy: (0, _.presentUser)(share.user),
    includeChildDocuments: share.includeChildDocuments,
    lastAccessedAt: share.lastAccessedAt,
    createdAt: share.createdAt,
    updatedAt: share.updatedAt
  };

  if (!isAdmin) {
    delete data.lastAccessedAt;
  }

  return data;
}