"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const Integration = _sequelize.sequelize.define("integration", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  type: _sequelize.DataTypes.STRING,
  service: _sequelize.DataTypes.STRING,
  settings: _sequelize.DataTypes.JSONB,
  events: _sequelize.DataTypes.ARRAY(_sequelize.DataTypes.STRING)
});

Integration.associate = models => {
  Integration.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
  Integration.belongsTo(models.Team, {
    as: "team",
    foreignKey: "teamId"
  });
  Integration.belongsTo(models.Collection, {
    as: "collection",
    foreignKey: "collectionId"
  });
  Integration.belongsTo(models.IntegrationAuthentication, {
    as: "authentication",
    foreignKey: "authenticationId"
  });
};

var _default = Integration;
exports.default = _default;