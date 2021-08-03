"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const Backlink = _sequelize.sequelize.define("backlink", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  }
});

Backlink.associate = models => {
  Backlink.belongsTo(models.Document, {
    as: "document",
    foreignKey: "documentId"
  });
  Backlink.belongsTo(models.Document, {
    as: "reverseDocument",
    foreignKey: "reverseDocumentId"
  });
  Backlink.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
};

var _default = Backlink;
exports.default = _default;