"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

function present(team) {
  return {
    id: team.id,
    name: team.name,
    avatarUrl: team.logoUrl,
    sharing: team.sharing,
    documentEmbeds: team.documentEmbeds,
    guestSignin: team.guestSignin,
    subdomain: team.subdomain,
    domain: team.domain,
    url: team.url
  };
}