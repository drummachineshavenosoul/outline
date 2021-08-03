"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DOCUMENT_VERSION = void 0;

var _removeMarkdown = _interopRequireDefault(require("@tommoor/remove-markdown"));

var _lodash = require("lodash");

var _randomstring = _interopRequireDefault(require("randomstring"));

var _sequelize = _interopRequireWildcard(require("sequelize"));

var _slateMdSerializer = _interopRequireDefault(require("slate-md-serializer"));

var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));

var _constants = require("../../shared/constants");

var _getTasks = _interopRequireDefault(require("../../shared/utils/getTasks"));

var _parseTitle = _interopRequireDefault(require("../../shared/utils/parseTitle"));

var _routeHelpers = require("../../shared/utils/routeHelpers");

var _unescape = _interopRequireDefault(require("../../shared/utils/unescape"));

var _models = require("../models");

var _sequelize2 = require("../sequelize");

var _slugify = _interopRequireDefault(require("../utils/slugify"));

var _Revision = _interopRequireDefault(require("./Revision"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Op = _sequelize.default.Op;
const serializer = new _slateMdSerializer.default();
const DOCUMENT_VERSION = 2;
exports.DOCUMENT_VERSION = DOCUMENT_VERSION;

const createUrlId = doc => {
  return doc.urlId = doc.urlId || _randomstring.default.generate(10);
};

const beforeCreate = async doc => {
  if (doc.version === undefined) {
    doc.version = DOCUMENT_VERSION;
  }

  return beforeSave(doc);
};

const beforeSave = async doc => {
  const {
    emoji
  } = (0, _parseTitle.default)(doc.text); // emoji in the title is split out for easier display

  doc.emoji = emoji; // ensure documents have a title

  doc.title = doc.title || "";

  if (doc.previous("title") && doc.previous("title") !== doc.title) {
    if (!doc.previousTitles) doc.previousTitles = [];
    doc.previousTitles = (0, _lodash.uniq)(doc.previousTitles.concat(doc.previous("title")));
  } // add the current user as a collaborator on this doc


  if (!doc.collaboratorIds) doc.collaboratorIds = [];
  doc.collaboratorIds = (0, _lodash.uniq)(doc.collaboratorIds.concat(doc.lastModifiedById)); // increment revision

  doc.revisionCount += 1;
  return doc;
};

const Document = _sequelize2.sequelize.define("document", {
  id: {
    type: _sequelize2.DataTypes.UUID,
    defaultValue: _sequelize2.DataTypes.UUIDV4,
    primaryKey: true
  },
  urlId: {
    type: _sequelize2.DataTypes.STRING,
    primaryKey: true
  },
  title: {
    type: _sequelize2.DataTypes.STRING,
    validate: {
      len: {
        args: [0, _constants.MAX_TITLE_LENGTH],
        msg: `Document title must be less than ${_constants.MAX_TITLE_LENGTH} characters`
      }
    }
  },
  previousTitles: _sequelize2.DataTypes.ARRAY(_sequelize2.DataTypes.STRING),
  version: _sequelize2.DataTypes.SMALLINT,
  template: _sequelize2.DataTypes.BOOLEAN,
  editorVersion: _sequelize2.DataTypes.STRING,
  text: _sequelize2.DataTypes.TEXT,
  isWelcome: {
    type: _sequelize2.DataTypes.BOOLEAN,
    defaultValue: false
  },
  revisionCount: {
    type: _sequelize2.DataTypes.INTEGER,
    defaultValue: 0
  },
  archivedAt: _sequelize2.DataTypes.DATE,
  publishedAt: _sequelize2.DataTypes.DATE,
  parentDocumentId: _sequelize2.DataTypes.UUID,
  collaboratorIds: _sequelize2.DataTypes.ARRAY(_sequelize2.DataTypes.UUID)
}, {
  paranoid: true,
  hooks: {
    beforeValidate: createUrlId,
    beforeCreate: beforeCreate,
    beforeUpdate: beforeSave
  },
  getterMethods: {
    url: function () {
      if (!this.title) return `/doc/untitled-${this.urlId}`;
      const slugifiedTitle = (0, _slugify.default)(this.title);
      return `/doc/${slugifiedTitle}-${this.urlId}`;
    },
    tasks: function () {
      return (0, _getTasks.default)(this.text || "");
    }
  }
}); // Class methods


Document.associate = models => {
  Document.belongsTo(models.Collection, {
    as: "collection",
    foreignKey: "collectionId",
    onDelete: "cascade"
  });
  Document.belongsTo(models.Team, {
    as: "team",
    foreignKey: "teamId"
  });
  Document.belongsTo(models.Document, {
    as: "document",
    foreignKey: "templateId"
  });
  Document.belongsTo(models.User, {
    as: "createdBy",
    foreignKey: "createdById"
  });
  Document.belongsTo(models.User, {
    as: "updatedBy",
    foreignKey: "lastModifiedById"
  });
  Document.belongsTo(models.User, {
    as: "pinnedBy",
    foreignKey: "pinnedById"
  });
  Document.hasMany(models.Revision, {
    as: "revisions",
    onDelete: "cascade"
  });
  Document.hasMany(models.Backlink, {
    as: "backlinks",
    onDelete: "cascade"
  });
  Document.hasMany(models.Star, {
    as: "starred",
    onDelete: "cascade"
  });
  Document.hasMany(models.View, {
    as: "views"
  });
  Document.addScope("defaultScope", {
    include: [{
      model: models.User,
      as: "createdBy",
      paranoid: false
    }, {
      model: models.User,
      as: "updatedBy",
      paranoid: false
    }],
    where: {
      publishedAt: {
        [Op.ne]: null
      }
    }
  });
  Document.addScope("withCollection", userId => {
    if (userId) {
      return {
        include: [{
          model: models.Collection.scope({
            method: ["withMembership", userId]
          }),
          as: "collection"
        }]
      };
    }

    return {
      include: [{
        model: models.Collection,
        as: "collection"
      }]
    };
  });
  Document.addScope("withUnpublished", {
    include: [{
      model: models.User,
      as: "createdBy",
      paranoid: false
    }, {
      model: models.User,
      as: "updatedBy",
      paranoid: false
    }]
  });
  Document.addScope("withViews", userId => {
    if (!userId) return {};
    return {
      include: [{
        model: models.View,
        as: "views",
        where: {
          userId
        },
        required: false,
        separate: true
      }]
    };
  });
  Document.addScope("withStarred", userId => ({
    include: [{
      model: models.Star,
      as: "starred",
      where: {
        userId
      },
      required: false,
      separate: true
    }]
  }));
};

Document.findByPk = async function (id, options = {}) {
  // allow default preloading of collection membership if `userId` is passed in find options
  // almost every endpoint needs the collection membership to determine policy permissions.
  const scope = this.scope("withUnpublished", {
    method: ["withCollection", options.userId]
  }, {
    method: ["withViews", options.userId]
  });

  if ((0, _isUUID.default)(id)) {
    return scope.findOne({
      where: {
        id
      },
      ...options
    });
  } else if (id.match(_routeHelpers.SLUG_URL_REGEX)) {
    return scope.findOne({
      where: {
        urlId: id.match(_routeHelpers.SLUG_URL_REGEX)[1]
      },
      ...options
    });
  }
};

function escape(query) {
  // replace "\" with escaped "\\" because sequelize.escape doesn't do it
  // https://github.com/sequelize/sequelize/issues/2950
  return _sequelize2.sequelize.escape(query).replace(/\\/g, "\\\\");
}

Document.searchForTeam = async (team, query, options = {}) => {
  const limit = options.limit || 15;
  const offset = options.offset || 0;
  const wildcardQuery = `${escape(query)}:*`;
  const collectionIds = await team.collectionIds(); // If the team has access no public collections then shortcircuit the rest of this

  if (!collectionIds.length) {
    return {
      results: [],
      totalCount: 0
    };
  } // Build the SQL query to get documentIds, ranking, and search term context


  const whereClause = `
  "searchVector" @@ to_tsquery('english', :query) AND
    "teamId" = :teamId AND
    "collectionId" IN(:collectionIds) AND
    "deletedAt" IS NULL AND
    "publishedAt" IS NOT NULL
  `;
  const selectSql = `
    SELECT
      id,
      ts_rank(documents."searchVector", to_tsquery('english', :query)) as "searchRanking",
      ts_headline('english', "text", to_tsquery('english', :query), 'MaxFragments=1, MinWords=20, MaxWords=30') as "searchContext"
    FROM documents
    WHERE ${whereClause}
    ORDER BY
      "searchRanking" DESC,
      "updatedAt" DESC
    LIMIT :limit
    OFFSET :offset;
  `;
  const countSql = `
    SELECT COUNT(id)
    FROM documents
    WHERE ${whereClause}
  `;
  const queryReplacements = {
    teamId: team.id,
    query: wildcardQuery,
    collectionIds
  };

  const resultsQuery = _sequelize2.sequelize.query(selectSql, {
    type: _sequelize2.sequelize.QueryTypes.SELECT,
    replacements: { ...queryReplacements,
      limit,
      offset
    }
  });

  const countQuery = _sequelize2.sequelize.query(countSql, {
    type: _sequelize2.sequelize.QueryTypes.SELECT,
    replacements: queryReplacements
  });

  const [results, [{
    count
  }]] = await Promise.all([resultsQuery, countQuery]); // Final query to get associated document data

  const documents = await Document.findAll({
    where: {
      id: (0, _lodash.map)(results, "id")
    },
    include: [{
      model: _models.Collection,
      as: "collection"
    }, {
      model: _models.User,
      as: "createdBy",
      paranoid: false
    }, {
      model: _models.User,
      as: "updatedBy",
      paranoid: false
    }]
  });
  return {
    results: (0, _lodash.map)(results, result => ({
      ranking: result.searchRanking,
      context: (0, _removeMarkdown.default)((0, _unescape.default)(result.searchContext), {
        stripHTML: false
      }),
      document: (0, _lodash.find)(documents, {
        id: result.id
      })
    })),
    totalCount: count
  };
};

Document.searchForUser = async (user, query, options = {}) => {
  const limit = options.limit || 15;
  const offset = options.offset || 0;
  const wildcardQuery = `${escape(query)}:*`; // Ensure we're filtering by the users accessible collections. If
  // collectionId is passed as an option it is assumed that the authorization
  // has already been done in the router

  let collectionIds;

  if (options.collectionId) {
    collectionIds = [options.collectionId];
  } else {
    collectionIds = await user.collectionIds();
  } // If the user has access to no collections then shortcircuit the rest of this


  if (!collectionIds.length) {
    return {
      results: [],
      totalCount: 0
    };
  }

  let dateFilter;

  if (options.dateFilter) {
    dateFilter = `1 ${options.dateFilter}`;
  } // Build the SQL query to get documentIds, ranking, and search term context


  const whereClause = `
  "searchVector" @@ to_tsquery('english', :query) AND
    "teamId" = :teamId AND
    "collectionId" IN(:collectionIds) AND
    ${options.dateFilter ? '"updatedAt" > now() - interval :dateFilter AND' : ""}
    ${options.collaboratorIds ? '"collaboratorIds" @> ARRAY[:collaboratorIds]::uuid[] AND' : ""}
    ${options.includeArchived ? "" : '"archivedAt" IS NULL AND'}
    "deletedAt" IS NULL AND
    ${options.includeDrafts ? '("publishedAt" IS NOT NULL OR "createdById" = :userId)' : '"publishedAt" IS NOT NULL'}
  `;
  const selectSql = `
  SELECT
    id,
    ts_rank(documents."searchVector", to_tsquery('english', :query)) as "searchRanking",
    ts_headline('english', "text", to_tsquery('english', :query), 'MaxFragments=1, MinWords=20, MaxWords=30') as "searchContext"
  FROM documents
  WHERE ${whereClause}
  ORDER BY
    "searchRanking" DESC,
    "updatedAt" DESC
  LIMIT :limit
  OFFSET :offset;
  `;
  const countSql = `
    SELECT COUNT(id)
    FROM documents
    WHERE ${whereClause}
  `;
  const queryReplacements = {
    teamId: user.teamId,
    userId: user.id,
    collaboratorIds: options.collaboratorIds,
    query: wildcardQuery,
    collectionIds,
    dateFilter
  };

  const resultsQuery = _sequelize2.sequelize.query(selectSql, {
    type: _sequelize2.sequelize.QueryTypes.SELECT,
    replacements: { ...queryReplacements,
      limit,
      offset
    }
  });

  const countQuery = _sequelize2.sequelize.query(countSql, {
    type: _sequelize2.sequelize.QueryTypes.SELECT,
    replacements: queryReplacements
  });

  const [results, [{
    count
  }]] = await Promise.all([resultsQuery, countQuery]); // Final query to get associated document data

  const documents = await Document.scope({
    method: ["withViews", user.id]
  }, {
    method: ["withCollection", user.id]
  }).findAll({
    where: {
      id: (0, _lodash.map)(results, "id")
    },
    include: [{
      model: _models.User,
      as: "createdBy",
      paranoid: false
    }, {
      model: _models.User,
      as: "updatedBy",
      paranoid: false
    }]
  });
  return {
    results: (0, _lodash.map)(results, result => ({
      ranking: result.searchRanking,
      context: (0, _removeMarkdown.default)((0, _unescape.default)(result.searchContext), {
        stripHTML: false
      }),
      document: (0, _lodash.find)(documents, {
        id: result.id
      })
    })),
    totalCount: count
  };
}; // Hooks


Document.addHook("beforeSave", async model => {
  if (!model.publishedAt || model.template) {
    return;
  }

  const collection = await _models.Collection.findByPk(model.collectionId);

  if (!collection) {
    return;
  }

  await collection.updateDocument(model);
  model.collection = collection;
});
Document.addHook("afterCreate", async model => {
  if (!model.publishedAt || model.template) {
    return;
  }

  const collection = await _models.Collection.findByPk(model.collectionId);

  if (!collection) {
    return;
  }

  await collection.addDocumentToStructure(model, 0);
  model.collection = collection;
  return model;
}); // Instance methods

Document.prototype.toMarkdown = function () {
  const text = (0, _unescape.default)(this.text);

  if (this.version) {
    return `# ${this.title}\n\n${text}`;
  }

  return text;
};

Document.prototype.migrateVersion = function () {
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
}; // Note: This method marks the document and it's children as deleted
// in the database, it does not permanently delete them OR remove
// from the collection structure.


Document.prototype.deleteWithChildren = async function (options) {
  // Helper to destroy all child documents for a document
  const loopChildren = async (documentId, opts) => {
    const childDocuments = await Document.findAll({
      where: {
        parentDocumentId: documentId
      }
    });
    childDocuments.forEach(async child => {
      await loopChildren(child.id, opts);
      await child.destroy(opts);
    });
  };

  await loopChildren(this.id, options);
  await this.destroy(options);
};

Document.prototype.archiveWithChildren = async function (userId, options) {
  const archivedAt = new Date(); // Helper to archive all child documents for a document

  const archiveChildren = async parentDocumentId => {
    const childDocuments = await Document.findAll({
      where: {
        parentDocumentId
      }
    });
    childDocuments.forEach(async child => {
      await archiveChildren(child.id);
      child.archivedAt = archivedAt;
      child.lastModifiedById = userId;
      await child.save(options);
    });
  };

  await archiveChildren(this.id);
  this.archivedAt = archivedAt;
  this.lastModifiedById = userId;
  return this.save(options);
};

Document.prototype.publish = async function (userId, options) {
  if (this.publishedAt) return this.save(options);

  if (!this.template) {
    const collection = await _models.Collection.findByPk(this.collectionId);
    await collection.addDocumentToStructure(this, 0);
  }

  this.lastModifiedById = userId;
  this.publishedAt = new Date();
  await this.save(options);
  return this;
};

Document.prototype.unpublish = async function (userId, options) {
  if (!this.publishedAt) return this;
  const collection = await this.getCollection();
  await collection.removeDocumentInStructure(this); // unpublishing a document converts the "ownership" to yourself, so that it
  // can appear in your drafts rather than the original creators

  this.userId = userId;
  this.lastModifiedById = userId;
  this.publishedAt = null;
  await this.save(options);
  return this;
}; // Moves a document from being visible to the team within a collection
// to the archived area, where it can be subsequently restored.


Document.prototype.archive = async function (userId) {
  // archive any children and remove from the document structure
  const collection = await this.getCollection();
  await collection.removeDocumentInStructure(this);
  this.collection = collection;
  await this.archiveWithChildren(userId);
  return this;
}; // Restore an archived document back to being visible to the team


Document.prototype.unarchive = async function (userId) {
  const collection = await this.getCollection(); // check to see if the documents parent hasn't been archived also
  // If it has then restore the document to the collection root.

  if (this.parentDocumentId) {
    const parent = await Document.findOne({
      where: {
        id: this.parentDocumentId,
        archivedAt: {
          [Op.eq]: null
        }
      }
    });
    if (!parent) this.parentDocumentId = null;
  }

  if (!this.template) {
    await collection.addDocumentToStructure(this);
    this.collection = collection;
  }

  if (this.deletedAt) {
    await this.restore();
  }

  this.archivedAt = null;
  this.lastModifiedById = userId;
  await this.save();
  return this;
}; // Delete a document, archived or otherwise.


Document.prototype.delete = function (userId) {
  return _sequelize2.sequelize.transaction(async transaction => {
    if (!this.archivedAt && !this.template) {
      // delete any children and remove from the document structure
      const collection = await this.getCollection({
        transaction
      });
      if (collection) await collection.deleteDocument(this, {
        transaction
      });
    } else {
      await this.destroy({
        transaction
      });
    }

    await _Revision.default.destroy({
      where: {
        documentId: this.id
      },
      transaction
    });
    await this.update({
      lastModifiedById: userId
    }, {
      transaction
    });
    return this;
  });
};

Document.prototype.getTimestamp = function () {
  return Math.round(new Date(this.updatedAt).getTime() / 1000);
};

Document.prototype.getSummary = function () {
  const plain = (0, _removeMarkdown.default)((0, _unescape.default)(this.text), {
    stripHTML: false
  });
  const lines = (0, _lodash.compact)(plain.split("\n"));
  const notEmpty = lines.length >= 1;

  if (this.version) {
    return notEmpty ? lines[0] : "";
  }

  return notEmpty ? lines[1] : "";
};

Document.prototype.toJSON = function () {
  // Warning: only use for new documents as order of children is
  // handled in the collection's documentStructure
  return {
    id: this.id,
    title: this.title,
    url: this.url,
    children: []
  };
};

var _default = Document;
exports.default = _default;