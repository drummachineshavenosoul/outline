"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.documentPermanentDeleter = documentPermanentDeleter;

var _debug = _interopRequireDefault(require("debug"));

var _models = require("../models");

var _sequelize = require("../sequelize");

var _parseAttachmentIds = _interopRequireDefault(require("../utils/parseAttachmentIds"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug.default)("commands");

async function documentPermanentDeleter(documents) {
  const activeDocument = documents.find(doc => !doc.deletedAt);

  if (activeDocument) {
    throw new Error(`Cannot permanently delete ${activeDocument.id} document. Please delete it and try again.`);
  }

  const query = `
    SELECT COUNT(id)
    FROM documents
    WHERE "searchVector" @@ to_tsquery('english', :query) AND
    "teamId" = :teamId AND
    "id" != :documentId
  `;

  for (const document of documents) {
    const attachmentIds = (0, _parseAttachmentIds.default)(document.text);

    for (const attachmentId of attachmentIds) {
      const [{
        count
      }] = await _sequelize.sequelize.query(query, {
        type: _sequelize.sequelize.QueryTypes.SELECT,
        replacements: {
          documentId: document.id,
          teamId: document.teamId,
          query: attachmentId
        }
      });

      if (parseInt(count) === 0) {
        const attachment = await _models.Attachment.findOne({
          where: {
            teamId: document.teamId,
            id: attachmentId
          }
        });

        if (attachment) {
          await attachment.destroy();
          log(`Attachment ${attachmentId} deleted`);
        } else {
          log(`Unknown attachment ${attachmentId} ignored`);
        }
      }
    }
  }

  return _models.Document.scope("withUnpublished").destroy({
    where: {
      id: documents.map(document => document.id)
    },
    force: true
  });
}