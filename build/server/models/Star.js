"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const Star = _sequelize.sequelize.define("star", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  }
});

Star.associate = models => {
  Star.belongsTo(models.Document);
  Star.belongsTo(models.User);
};

var _default = Star;
exports.default = _default;