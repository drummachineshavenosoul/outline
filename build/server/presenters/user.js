"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _models = require("../models");

var _default = (user, options = {}) => {
  const userData = {};
  userData.id = user.id;
  userData.createdAt = user.createdAt;
  userData.name = user.name;
  userData.isAdmin = user.isAdmin;
  userData.isViewer = user.isViewer;
  userData.isSuspended = user.isSuspended;
  userData.avatarUrl = user.avatarUrl;
  userData.lastActiveAt = user.lastActiveAt;

  if (options.includeDetails) {
    userData.email = user.email;
    userData.language = user.language || process.env.DEFAULT_LANGUAGE || "en_US";
  }

  return userData;
};

exports.default = _default;