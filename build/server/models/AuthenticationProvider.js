"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _providers = _interopRequireDefault(require("../auth/providers"));

var _errors = require("../errors");

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const AuthenticationProvider = _sequelize.sequelize.define("authentication_providers", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: _sequelize.DataTypes.STRING,
    validate: {
      isIn: [_providers.default.map(p => p.id)]
    }
  },
  enabled: {
    type: _sequelize.DataTypes.BOOLEAN,
    defaultValue: true
  },
  providerId: {
    type: _sequelize.DataTypes.STRING
  }
}, {
  timestamps: true,
  updatedAt: false
});

AuthenticationProvider.associate = models => {
  AuthenticationProvider.belongsTo(models.Team);
  AuthenticationProvider.hasMany(models.UserAuthentication);
};

AuthenticationProvider.prototype.disable = async function () {
  const res = await AuthenticationProvider.findAndCountAll({
    where: {
      teamId: this.teamId,
      enabled: true,
      id: {
        [_sequelize.Op.ne]: this.id
      }
    },
    limit: 1
  });

  if (res.count >= 1) {
    return this.update({
      enabled: false
    });
  } else {
    throw new _errors.ValidationError("At least one authentication provider is required");
  }
};

AuthenticationProvider.prototype.enable = async function () {
  return this.update({
    enabled: true
  });
};

var _default = AuthenticationProvider;
exports.default = _default;