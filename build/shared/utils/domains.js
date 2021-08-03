"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.join");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseDomain = parseDomain;
exports.stripSubdomain = stripSubdomain;
exports.isCustomSubdomain = isCustomSubdomain;
exports.RESERVED_SUBDOMAINS = void 0;

var _trim2 = _interopRequireDefault(require("lodash/trim"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// we originally used the parse-domain npm module however this includes
// a large list of possible TLD's which increase the size of the bundle
// unnecessarily for our usecase of trusted input.
function parseDomain(url) {
  if (typeof url !== "string") return null;
  if (url === "") return null; // strip extermeties and whitespace from input

  var normalizedDomain = (0, _trim2.default)(url.replace(/(https?:)?\/\//, ""));
  var parts = normalizedDomain.split("."); // ensure the last part only includes something that looks like a TLD

  function cleanTLD() {
    var tld = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    return tld.split(/[/:?]/)[0];
  } // simplistic subdomain parse, we don't need to take into account subdomains
  // with "." characters as these are not valid in Outline


  if (parts.length >= 3) {
    return {
      subdomain: parts[0],
      domain: parts[1],
      tld: cleanTLD(parts.slice(2).join("."))
    };
  }

  if (parts.length === 2) {
    return {
      subdomain: "",
      domain: parts[0],
      tld: cleanTLD(parts.slice(1).join("."))
    };
  } // one-part domain handler for things like localhost


  if (parts.length === 1) {
    return {
      subdomain: "",
      domain: cleanTLD(parts.slice(0).join()),
      tld: ""
    };
  }

  return null;
}

function stripSubdomain(hostname) {
  var parsed = parseDomain(hostname);
  if (!parsed) return hostname;
  if (parsed.tld) return "".concat(parsed.domain, ".").concat(parsed.tld);
  return parsed.domain;
}

function isCustomSubdomain(hostname) {
  var parsed = parseDomain(hostname);

  if (!parsed || !parsed.subdomain || parsed.subdomain === "app" || parsed.subdomain === "www") {
    return false;
  }

  return true;
}

var RESERVED_SUBDOMAINS = ["about", "account", "admin", "advertising", "api", "app", "assets", "archive", "beta", "billing", "blog", "cache", "cdn", "code", "community", "dashboard", "developer", "developers", "forum", "help", "home", "http", "https", "imap", "localhost", "mail", "marketing", "mobile", "new", "news", "newsletter", "ns1", "ns2", "ns3", "ns4", "password", "profile", "sandbox", "script", "scripts", "setup", "signin", "signup", "site", "smtp", "support", "status", "static", "stats", "test", "update", "updates", "ws", "wss", "web", "websockets", "www", "www1", "www2", "www3", "www4"];
exports.RESERVED_SUBDOMAINS = RESERVED_SUBDOMAINS;