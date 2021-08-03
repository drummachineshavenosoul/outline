"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const CollectionUser = _sequelize.sequelize.define("collection_user", {
  permission: {
    type: _sequelize.DataTypes.STRING,
    defaultValue: "read_write",
    validate: {
      isIn: [["read", "read_write", "maintainer"]]
    }
  }
}, {
  timestamps: true
});

CollectionUser.associate = models => {
  CollectionUser.belongsTo(models.Collection, {
    as: "collection",
    foreignKey: "collectionId"
  });
  CollectionUser.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
  CollectionUser.belongsTo(models.User, {
    as: "createdBy",
    foreignKey: "createdById"
  });
};

var _default = CollectionUser;
exports.default = _default;