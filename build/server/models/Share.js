"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const Share = _sequelize.sequelize.define("share", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  published: _sequelize.DataTypes.BOOLEAN,
  includeChildDocuments: _sequelize.DataTypes.BOOLEAN,
  revokedAt: _sequelize.DataTypes.DATE,
  revokedById: _sequelize.DataTypes.UUID,
  lastAccessedAt: _sequelize.DataTypes.DATE
}, {
  getterMethods: {
    isRevoked() {
      return !!this.revokedAt;
    }

  }
});

Share.associate = models => {
  Share.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
  Share.belongsTo(models.Team, {
    as: "team",
    foreignKey: "teamId"
  });
  Share.belongsTo(models.Document.scope("withUnpublished"), {
    as: "document",
    foreignKey: "documentId"
  });
  Share.addScope("defaultScope", {
    include: [{
      association: "user",
      paranoid: false
    }, {
      association: "document"
    }, {
      association: "team"
    }]
  });
};

Share.prototype.revoke = function (userId) {
  this.revokedAt = new Date();
  this.revokedById = userId;
  return this.save();
};

var _default = Share;
exports.default = _default;