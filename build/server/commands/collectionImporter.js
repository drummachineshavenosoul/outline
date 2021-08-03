"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = collectionImporter;

var _fs = _interopRequireDefault(require("fs"));

var _os = _interopRequireDefault(require("os"));

var _path = _interopRequireDefault(require("path"));

var _debug = _interopRequireDefault(require("debug"));

var _file = _interopRequireDefault(require("formidable/lib/file"));

var _invariant = _interopRequireDefault(require("invariant"));

var _lodash = require("lodash");

var _uuid = require("uuid");

var _zip = require("../../shared/utils/zip");

var _errors = require("../errors");

var _models = require("../models");

var _attachmentCreator = _interopRequireDefault(require("./attachmentCreator"));

var _documentCreator = _interopRequireDefault(require("./documentCreator"));

var _documentImporter = _interopRequireDefault(require("./documentImporter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug.default)("commands");

async function collectionImporter({
  file,
  type,
  user,
  ip
}) {
  // load the zip structure into memory
  const zipData = await _fs.default.promises.readFile(file.path);
  let items;

  try {
    items = await await (0, _zip.parseOutlineExport)(zipData);
  } catch (err) {
    throw new _errors.FileImportError(err.message);
  }

  if (!items.filter(item => item.type === "document").length) {
    throw new _errors.FileImportError("Uploaded file does not contain importable documents");
  } // store progress and pointers


  let collections = {};
  let documents = {};
  let attachments = {};

  for (const item of items) {
    if (item.type === "collection") {
      // check if collection with name exists
      let [collection, isCreated] = await _models.Collection.findOrCreate({
        where: {
          teamId: user.teamId,
          name: item.name
        },
        defaults: {
          createdById: user.id,
          permission: "read_write"
        }
      }); // create new collection if name already exists, yes it's possible that
      // there is also a "Name (Imported)" but this is a case not worth dealing
      // with right now

      if (!isCreated) {
        const name = `${item.name} (Imported)`;
        collection = await _models.Collection.create({
          teamId: user.teamId,
          createdById: user.id,
          name,
          permission: "read_write"
        });
        await _models.Event.create({
          name: "collections.create",
          collectionId: collection.id,
          teamId: collection.teamId,
          actorId: user.id,
          data: {
            name
          },
          ip
        });
      }

      collections[item.path] = collection;
      continue;
    }

    if (item.type === "document") {
      const collectionDir = item.dir.split("/")[0];
      const collection = collections[collectionDir];
      (0, _invariant.default)(collection, `Collection must exist for document ${item.dir}`); // we have a document

      const content = await item.item.async("string");

      const name = _path.default.basename(item.name);

      const tmpDir = _os.default.tmpdir();

      const tmpFilePath = `${tmpDir}/upload-${(0, _uuid.v4)()}`;
      await _fs.default.promises.writeFile(tmpFilePath, content);
      const file = new _file.default({
        name,
        type: "text/markdown",
        path: tmpFilePath
      });
      const {
        text,
        title
      } = await (0, _documentImporter.default)({
        file,
        user,
        ip
      });
      await _fs.default.promises.unlink(tmpFilePath); // must be a nested document, find and reference the parent document

      let parentDocumentId;

      if (item.depth > 1) {
        const parentDocument = documents[`${item.dir}.md`] || documents[item.dir];
        (0, _invariant.default)(parentDocument, `Document must exist for parent ${item.dir}`);
        parentDocumentId = parentDocument.id;
      }

      const document = await (0, _documentCreator.default)({
        source: "import",
        title,
        text,
        publish: true,
        collectionId: collection.id,
        createdAt: item.metadata.createdAt ? new Date(item.metadata.createdAt) : item.date,
        updatedAt: item.date,
        parentDocumentId,
        user,
        ip
      });
      documents[item.path] = document;
      continue;
    }

    if (item.type === "attachment") {
      const buffer = await item.item.async("nodebuffer");
      const attachment = await (0, _attachmentCreator.default)({
        source: "import",
        name: item.name,
        type,
        buffer,
        user,
        ip
      });
      attachments[item.path] = attachment;
      continue;
    }

    log(`Skipped importing ${item.path}`);
  } // All collections, documents, and attachments have been created – time to
  // update the documents to point to newly uploaded attachments where possible


  for (const attachmentPath of (0, _lodash.keys)(attachments)) {
    const attachment = attachments[attachmentPath];

    for (const document of (0, _lodash.values)(documents)) {
      // pull the collection and subdirectory out of the path name, upload folders
      // in an Outline export are relative to the document itself
      const normalizedAttachmentPath = attachmentPath.replace(/(.*)uploads\//, "uploads/");
      document.text = document.text.replace(attachmentPath, attachment.redirectUrl).replace(normalizedAttachmentPath, attachment.redirectUrl).replace(`/${normalizedAttachmentPath}`, attachment.redirectUrl); // does nothing if the document text is unchanged

      await document.save({
        fields: ["text"]
      });
    }
  } // reload collections to get document mapping


  for (const collection of (0, _lodash.values)(collections)) {
    await collection.reload();
  }

  return {
    documents: (0, _lodash.values)(documents),
    collections: (0, _lodash.values)(collections),
    attachments: (0, _lodash.values)(attachments)
  };
}