"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeIndexCollision;

var _fractionalIndex = _interopRequireDefault(require("fractional-index"));

var _models = require("../models");

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param teamId The team id whose collections has to be fetched
 * @param index the index for which collision has to be checked
 * @returns An index, if there is collision returns a new index otherwise the same index
 */
async function removeIndexCollision(teamId, index) {
  const collection = await _models.Collection.findOne({
    where: {
      teamId,
      deletedAt: null,
      index
    }
  });

  if (!collection) {
    return index;
  }

  const nextCollection = await _models.Collection.findAll({
    where: {
      teamId,
      deletedAt: null,
      index: {
        [_sequelize.Op.gt]: index
      }
    },
    attributes: ["id", "index"],
    limit: 1,
    order: [_sequelize.sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]]
  });
  const nextCollectionIndex = nextCollection.length ? nextCollection[0].index : null;
  return (0, _fractionalIndex.default)(index, nextCollectionIndex);
}