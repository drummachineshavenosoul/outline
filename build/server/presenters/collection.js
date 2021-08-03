"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;

var _naturalSort = _interopRequireDefault(require("../../shared/utils/naturalSort"));

var _models = require("../models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sortDocuments = (documents, sort) => {
  const orderedDocs = (0, _naturalSort.default)(documents, sort.field, {
    direction: sort.direction
  });
  return orderedDocs.map(document => ({ ...document,
    children: sortDocuments(document.children, sort)
  }));
};

function present(collection) {
  const data = {
    id: collection.id,
    url: collection.url,
    urlId: collection.urlId,
    name: collection.name,
    description: collection.description,
    sort: collection.sort,
    icon: collection.icon,
    index: collection.index,
    color: collection.color || "#4E5C6E",
    permission: collection.permission,
    sharing: collection.sharing,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    deletedAt: collection.deletedAt,
    documents: collection.documentStructure || []
  }; // Handle the "sort" field being empty here for backwards compatability

  if (!data.sort) {
    data.sort = {
      field: "title",
      direction: "asc"
    };
  } // "index" field is manually sorted and is represented by the documentStructure
  // already saved in the database, no further sort is needed


  if (data.sort.field !== "index") {
    data.documents = sortDocuments(collection.documentStructure, data.sort);
  }

  return data;
}