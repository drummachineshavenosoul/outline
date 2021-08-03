"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.archiveCollection = archiveCollection;
exports.archiveCollections = archiveCollections;

var _fs = _interopRequireDefault(require("fs"));

var Sentry = _interopRequireWildcard(require("@sentry/node"));

var _jszip = _interopRequireDefault(require("jszip"));

var _tmp = _interopRequireDefault(require("tmp"));

var _models = require("../models");

var _fs2 = require("./fs");

var _s = require("./s3");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function addToArchive(zip, documents) {
  for (const doc of documents) {
    const document = await _models.Document.findByPk(doc.id);

    if (!document) {
      continue;
    }

    let text = document.toMarkdown();
    const attachments = await _models.Attachment.findAll({
      where: {
        documentId: document.id
      }
    });

    for (const attachment of attachments) {
      await addImageToArchive(zip, attachment.key);
      text = text.replace(attachment.redirectUrl, encodeURI(attachment.key));
    }

    const title = (0, _fs2.serializeFilename)(document.title) || "Untitled";
    zip.file(`${title}.md`, text, {
      date: document.updatedAt,
      comment: JSON.stringify({
        pinned: document.pinned,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      })
    });

    if (doc.children && doc.children.length) {
      const folder = zip.folder(title);
      await addToArchive(folder, doc.children);
    }
  }
}

async function addImageToArchive(zip, key) {
  try {
    const img = await (0, _s.getFileByKey)(key);
    zip.file(key, img, {
      createFolders: true
    });
  } catch (err) {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    } // error during file retrieval


    console.error(err);
  }
}

async function archiveToPath(zip) {
  return new Promise((resolve, reject) => {
    _tmp.default.file({
      prefix: "export-",
      postfix: ".zip"
    }, (err, path) => {
      if (err) return reject(err);
      zip.generateNodeStream({
        type: "nodebuffer",
        streamFiles: true
      }).pipe(_fs.default.createWriteStream(path)).on("finish", () => resolve(path)).on("error", reject);
    });
  });
}

async function archiveCollection(collection) {
  const zip = new _jszip.default();

  if (collection.documentStructure) {
    const folder = zip.folder(collection.name);
    await addToArchive(folder, collection.documentStructure);
  }

  return archiveToPath(zip);
}

async function archiveCollections(collections) {
  const zip = new _jszip.default();

  for (const collection of collections) {
    if (collection.documentStructure) {
      const folder = zip.folder(collection.name);
      await addToArchive(folder, collection.documentStructure);
    }
  }

  return archiveToPath(zip);
}