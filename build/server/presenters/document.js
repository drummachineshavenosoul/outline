"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _models = require("../models");

var _parseAttachmentIds = _interopRequireDefault(require("../utils/parseAttachmentIds"));

var _s = require("../utils/s3");

var _user = _interopRequireDefault(require("./user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// replaces attachments.redirect urls with signed/authenticated url equivalents
async function replaceImageAttachments(text) {
  const attachmentIds = (0, _parseAttachmentIds.default)(text);
  await Promise.all(attachmentIds.map(async id => {
    const attachment = await _models.Attachment.findByPk(id);

    if (attachment) {
      const accessUrl = await (0, _s.getSignedImageUrl)(attachment.key);
      text = text.replace(attachment.redirectUrl, accessUrl);
    }
  }));
  return text;
}

async function present(document, options) {
  options = {
    isPublic: false,
    ...options
  };
  await document.migrateVersion();
  let text = options.isPublic ? await replaceImageAttachments(document.text) : document.text;
  const data = {
    id: document.id,
    url: document.url,
    urlId: document.urlId,
    title: document.title,
    text,
    emoji: document.emoji,
    tasks: document.tasks,
    createdAt: document.createdAt,
    createdBy: undefined,
    updatedAt: document.updatedAt,
    updatedBy: undefined,
    publishedAt: document.publishedAt,
    archivedAt: document.archivedAt,
    deletedAt: document.deletedAt,
    teamId: document.teamId,
    template: document.template,
    templateId: document.templateId,
    collaboratorIds: [],
    starred: document.starred ? !!document.starred.length : undefined,
    revision: document.revisionCount,
    pinned: undefined,
    collectionId: undefined,
    parentDocumentId: undefined,
    lastViewedAt: undefined
  };

  if (!!document.views && document.views.length > 0) {
    data.lastViewedAt = document.views[0].updatedAt;
  }

  if (!options.isPublic) {
    data.pinned = !!document.pinnedById;
    data.collectionId = document.collectionId;
    data.parentDocumentId = document.parentDocumentId;
    data.createdBy = (0, _user.default)(document.createdBy);
    data.updatedBy = (0, _user.default)(document.updatedBy);
    data.collaboratorIds = document.collaboratorIds;
  }

  return data;
}