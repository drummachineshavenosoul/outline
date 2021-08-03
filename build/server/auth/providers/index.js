"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _routeHelpers = require("../../../shared/utils/routeHelpers");

var _fs = require("../../utils/fs");

let providers = [];
(0, _fs.requireDirectory)(__dirname).forEach(([module, id]) => {
  const {
    config,
    default: router
  } = module;

  if (id === "index") {
    return;
  }

  if (!config) {
    throw new Error(`Auth providers must export a 'config' object, missing in ${id}`);
  }

  if (!router || !router.routes) {
    throw new Error(`Default export of an auth provider must be a koa-router, missing in ${id}`);
  }

  if (config && config.enabled) {
    providers.push({
      id,
      name: config.name,
      enabled: config.enabled,
      authUrl: (0, _routeHelpers.signin)(id),
      router: router
    });
  }
});
var _default = providers;
exports.default = _default;