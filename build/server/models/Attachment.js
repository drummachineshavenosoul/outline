"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _sequelize = require("../sequelize");

var _s = require("../utils/s3");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Attachment = _sequelize.sequelize.define("attachment", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false
  },
  contentType: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: _sequelize.DataTypes.BIGINT,
    allowNull: false
  },
  acl: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false,
    defaultValue: "public-read",
    validate: {
      isIn: [["private", "public-read"]]
    }
  }
}, {
  getterMethods: {
    name: function () {
      return _path.default.parse(this.key).base;
    },
    redirectUrl: function () {
      return `/api/attachments.redirect?id=${this.id}`;
    },
    isPrivate: function () {
      return this.acl === "private";
    },
    buffer: function () {
      return (0, _s.getFileByKey)(this.key);
    }
  }
});

Attachment.beforeDestroy(async model => {
  await (0, _s.deleteFromS3)(model.key);
});

Attachment.associate = models => {
  Attachment.belongsTo(models.Team);
  Attachment.belongsTo(models.Document);
  Attachment.belongsTo(models.User);
};

var _default = Attachment;
exports.default = _default;