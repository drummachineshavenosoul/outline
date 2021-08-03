"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

var _presenters = require("../presenters");

function present(view) {
  return {
    id: view.id,
    documentId: view.documentId,
    count: view.count,
    firstViewedAt: view.createdAt,
    lastViewedAt: view.updatedAt,
    user: (0, _presenters.presentUser)(view.user)
  };
}