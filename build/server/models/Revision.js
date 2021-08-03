"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slateMdSerializer = _interopRequireDefault(require("slate-md-serializer"));

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const serializer = new _slateMdSerializer.default();

const Revision = _sequelize.sequelize.define("revision", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  version: _sequelize.DataTypes.SMALLINT,
  editorVersion: _sequelize.DataTypes.STRING,
  title: _sequelize.DataTypes.STRING,
  text: _sequelize.DataTypes.TEXT
});

Revision.associate = models => {
  Revision.belongsTo(models.Document, {
    as: "document",
    foreignKey: "documentId",
    onDelete: "cascade"
  });
  Revision.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
  Revision.addScope("defaultScope", {
    include: [{
      model: models.User,
      as: "user",
      paranoid: false
    }]
  }, {
    override: true
  });
};

Revision.findLatest = function (documentId) {
  return Revision.findOne({
    where: {
      documentId
    },
    order: [["createdAt", "DESC"]]
  });
};

Revision.createFromDocument = function (document, options) {
  return Revision.create({
    title: document.title,
    text: document.text,
    userId: document.lastModifiedById,
    editorVersion: document.editorVersion,
    version: document.version,
    documentId: document.id,
    // revision time is set to the last time document was touched as this
    // handler can be debounced in the case of an update
    createdAt: document.updatedAt
  }, options);
};

Revision.prototype.migrateVersion = function () {
  let migrated = false; // migrate from document version 0 -> 1

  if (!this.version) {
    // removing the title from the document text attribute
    this.text = this.text.replace(/^#\s(.*)\n/, "");
    this.version = 1;
    migrated = true;
  } // migrate from document version 1 -> 2


  if (this.version === 1) {
    const nodes = serializer.deserialize(this.text);
    this.text = serializer.serialize(nodes, {
      version: 2
    });
    this.version = 2;
    migrated = true;
  }

  if (migrated) {
    return this.save({
      silent: true,
      hooks: false
    });
  }
};

var _default = Revision;
exports.default = _default;