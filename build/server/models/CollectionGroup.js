"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const CollectionGroup = _sequelize.sequelize.define("collection_group", {
  permission: {
    type: _sequelize.DataTypes.STRING,
    defaultValue: "read_write",
    validate: {
      isIn: [["read", "read_write", "maintainer"]]
    }
  }
}, {
  timestamps: true,
  paranoid: true
});

CollectionGroup.associate = models => {
  CollectionGroup.belongsTo(models.Collection, {
    as: "collection",
    foreignKey: "collectionId",
    primary: true
  });
  CollectionGroup.belongsTo(models.Group, {
    as: "group",
    foreignKey: "groupId",
    primary: true
  });
  CollectionGroup.belongsTo(models.User, {
    as: "createdBy",
    foreignKey: "createdById"
  });
};

var _default = CollectionGroup;
exports.default = _default;