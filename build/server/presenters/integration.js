"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

function present(integration) {
  return {
    id: integration.id,
    type: integration.type,
    userId: integration.userId,
    teamId: integration.teamId,
    collectionId: integration.collectionId,
    authenticationId: integration.authenticationId,
    service: integration.service,
    events: integration.events,
    settings: integration.settings,
    createdAt: integration.createdAt,
    updatedAt: integration.updatedAt
  };
}