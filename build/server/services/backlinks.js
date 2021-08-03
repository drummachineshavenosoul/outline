"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _models = require("../models");

var _sequelize = require("../sequelize");

var _parseDocumentIds = _interopRequireDefault(require("../utils/parseDocumentIds"));

var _slugify = _interopRequireDefault(require("../utils/slugify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Backlinks {
  async on(event) {
    switch (event.name) {
      case "documents.publish":
        {
          const document = await _models.Document.findByPk(event.documentId);
          if (!document) return;
          const linkIds = (0, _parseDocumentIds.default)(document.text);
          await Promise.all(linkIds.map(async linkId => {
            const linkedDocument = await _models.Document.findByPk(linkId);

            if (!linkedDocument || linkedDocument.id === event.documentId) {
              return;
            }

            await _models.Backlink.findOrCreate({
              where: {
                documentId: linkedDocument.id,
                reverseDocumentId: event.documentId
              },
              defaults: {
                userId: document.lastModifiedById
              }
            });
          }));
          break;
        }

      case "documents.update":
        {
          const document = await _models.Document.findByPk(event.documentId);
          if (!document) return; // backlinks are only created for published documents

          if (!document.publishedAt) return;
          const linkIds = (0, _parseDocumentIds.default)(document.text);
          const linkedDocumentIds = []; // create or find existing backlink records for referenced docs

          await Promise.all(linkIds.map(async linkId => {
            const linkedDocument = await _models.Document.findByPk(linkId);

            if (!linkedDocument || linkedDocument.id === event.documentId) {
              return;
            }

            await _models.Backlink.findOrCreate({
              where: {
                documentId: linkedDocument.id,
                reverseDocumentId: event.documentId
              },
              defaults: {
                userId: document.lastModifiedById
              }
            });
            linkedDocumentIds.push(linkedDocument.id);
          })); // delete any backlinks that no longer exist

          await _models.Backlink.destroy({
            where: {
              documentId: {
                [_sequelize.Op.notIn]: linkedDocumentIds
              },
              reverseDocumentId: event.documentId
            }
          });
          break;
        }

      case "documents.title_change":
        {
          const document = await _models.Document.findByPk(event.documentId);
          if (!document) return; // might as well check

          const {
            title,
            previousTitle
          } = event.data;
          if (!previousTitle || title === previousTitle) break; // update any link titles in documents that lead to this one

          const backlinks = await _models.Backlink.findAll({
            where: {
              documentId: event.documentId
            },
            include: [{
              model: _models.Document,
              as: "reverseDocument"
            }]
          });
          await Promise.all(backlinks.map(async backlink => {
            const previousUrl = `/doc/${(0, _slugify.default)(previousTitle)}-${document.urlId}`; // find links in the other document that lead to this one and have
            // the old title as anchor text. Go ahead and update those to the
            // new title automatically

            backlink.reverseDocument.text = backlink.reverseDocument.text.replace(`[${previousTitle}](${previousUrl})`, `[${title}](${document.url})`);
            await backlink.reverseDocument.save({
              silent: true,
              hooks: false
            });
          }));
          break;
        }

      case "documents.delete":
        {
          await _models.Backlink.destroy({
            where: {
              [_sequelize.Op.or]: [{
                reverseDocumentId: event.documentId
              }, {
                documentId: event.documentId
              }]
            }
          });
          break;
        }

      default:
    }
  }

}

exports.default = Backlinks;