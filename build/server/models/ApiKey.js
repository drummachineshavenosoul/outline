"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _randomstring = _interopRequireDefault(require("randomstring"));

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ApiKey = _sequelize.sequelize.define("apiKey", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  name: _sequelize.DataTypes.STRING,
  secret: {
    type: _sequelize.DataTypes.STRING,
    unique: true
  }
}, {
  paranoid: true,
  hooks: {
    beforeValidate: key => {
      key.secret = _randomstring.default.generate(38);
    }
  }
});

ApiKey.associate = models => {
  ApiKey.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
};

var _default = ApiKey;
exports.default = _default;