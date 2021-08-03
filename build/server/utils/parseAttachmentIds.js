"use strict";

require("core-js/modules/esnext.string.match-all");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAttachmentIds;
const attachmentRegex = /\/api\/attachments\.redirect\?id=(?<id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;

function parseAttachmentIds(text) {
  return [...text.matchAll(attachmentRegex)].map(match => match.groups && match.groups.id);
}