"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCookieDomain = getCookieDomain;
exports.isCustomDomain = isCustomDomain;

var _domains = require("../../shared/utils/domains");

function getCookieDomain(domain) {
  return process.env.SUBDOMAINS_ENABLED === "true" ? (0, _domains.stripSubdomain)(domain) : domain;
}

function isCustomDomain(hostname) {
  const parsed = (0, _domains.parseDomain)(hostname);
  const main = (0, _domains.parseDomain)(process.env.URL);
  return parsed && main && (main.domain !== parsed.domain || main.tld !== parsed.tld);
}