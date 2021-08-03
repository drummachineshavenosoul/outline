"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sequelize = exports.Op = exports.DataTypes = exports.encryptedFields = void 0;

var _debug = _interopRequireDefault(require("debug"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _sequelizeEncrypted = _interopRequireDefault(require("sequelize-encrypted"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isProduction = process.env.NODE_ENV === "production";
const isSSLDisabled = process.env.PGSSLMODE === "disable";

const encryptedFields = () => (0, _sequelizeEncrypted.default)(_sequelize.default, process.env.SECRET_KEY);

exports.encryptedFields = encryptedFields;
const DataTypes = _sequelize.default;
exports.DataTypes = DataTypes;
const Op = _sequelize.default.Op;
exports.Op = Op;
const sequelize = new _sequelize.default(process.env.DATABASE_URL || process.env.DATABASE_CONNECTION_POOL_URL, {
  logging: (0, _debug.default)("sql"),
  typeValidation: true,
  dialectOptions: {
    ssl: isProduction && !isSSLDisabled ? {
      // Ref.: https://github.com/brianc/node-postgres/issues/2009
      rejectUnauthorized: false
    } : false
  }
});
exports.sequelize = sequelize;