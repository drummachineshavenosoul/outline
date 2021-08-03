"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.iterator");

require("core-js/modules/es.string.replace");

require("core-js/modules/web.dom-collections.iterator");

require("core-js/modules/web.url");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseDocumentSlug;

function parseDocumentSlug(url) {
  var parsed;

  if (url[0] === "/") {
    parsed = url;
  } else {
    try {
      parsed = new URL(url).pathname;
    } catch (err) {
      return;
    }
  }

  return parsed.replace(/^\/doc\//, "");
}