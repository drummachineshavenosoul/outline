"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = collectionIndexing;

var _fractionalIndex = _interopRequireDefault(require("fractional-index"));

var _naturalSort = _interopRequireDefault(require("../../shared/utils/naturalSort"));

var _models = require("../models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function collectionIndexing(teamId) {
  const collections = await _models.Collection.findAll({
    where: {
      teamId,
      deletedAt: null
    },
    //no point in maintaining index of deleted collections.
    attributes: ["id", "index", "name"]
  });
  let sortableCollections = collections.map(collection => {
    return [collection, collection.index];
  });
  sortableCollections = (0, _naturalSort.default)(sortableCollections, collection => collection[0].name); //for each collection with null index, use previous collection index to create new index

  let previousCollectionIndex = null;

  for (const collection of sortableCollections) {
    if (collection[1] === null) {
      const index = (0, _fractionalIndex.default)(previousCollectionIndex, collection[1]);
      collection[0].index = index;
      await collection[0].save();
    }

    previousCollectionIndex = collection[0].index;
  }

  const indexedCollections = {};
  sortableCollections.forEach(collection => {
    indexedCollections[collection[0].id] = collection[0].index;
  });
  return indexedCollections;
}