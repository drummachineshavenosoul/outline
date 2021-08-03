"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const UserAuthentication = _sequelize.sequelize.define("user_authentications", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  scopes: _sequelize.DataTypes.ARRAY(_sequelize.DataTypes.STRING),
  accessToken: (0, _sequelize.encryptedFields)().vault("accessToken"),
  refreshToken: (0, _sequelize.encryptedFields)().vault("refreshToken"),
  providerId: {
    type: _sequelize.DataTypes.STRING,
    unique: true
  }
});

UserAuthentication.associate = models => {
  UserAuthentication.belongsTo(models.AuthenticationProvider);
  UserAuthentication.belongsTo(models.User);
};

var _default = UserAuthentication;
exports.default = _default;