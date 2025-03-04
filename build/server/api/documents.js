"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _date = require("../../shared/utils/date");

var _documentCreator = _interopRequireDefault(require("../commands/documentCreator"));

var _documentImporter = _interopRequireDefault(require("../commands/documentImporter"));

var _documentMover = _interopRequireDefault(require("../commands/documentMover"));

var _documentPermanentDeleter = require("../commands/documentPermanentDeleter");

var _env = _interopRequireDefault(require("../env"));

var _errors = require("../errors");

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _policies = _interopRequireDefault(require("../policies"));

var _presenters = require("../presenters");

var _sequelize2 = require("../sequelize");

var _pagination = _interopRequireDefault(require("./middlewares/pagination"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Op = _sequelize.default.Op;
const {
  authorize,
  cannot
} = _policies.default;
const router = new _koaRouter.default();
router.post("documents.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    sort = "updatedAt",
    template,
    backlinkDocumentId,
    parentDocumentId
  } = ctx.body; // collection and user are here for backwards compatibility

  const collectionId = ctx.body.collectionId || ctx.body.collection;
  const createdById = ctx.body.userId || ctx.body.user;
  let direction = ctx.body.direction;
  if (direction !== "ASC") direction = "DESC"; // always filter by the current team

  const user = ctx.state.user;
  let where = {
    teamId: user.teamId,
    archivedAt: {
      [Op.eq]: null
    }
  };

  if (template) {
    where = { ...where,
      template: true
    };
  } // if a specific user is passed then add to filters. If the user doesn't
  // exist in the team then nothing will be returned, so no need to check auth


  if (createdById) {
    ctx.assertUuid(createdById, "user must be a UUID");
    where = { ...where,
      createdById
    };
  }

  let documentIds = []; // if a specific collection is passed then we need to check auth to view it

  if (collectionId) {
    ctx.assertUuid(collectionId, "collection must be a UUID");
    where = { ...where,
      collectionId
    };
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    authorize(user, "read", collection); // index sort is special because it uses the order of the documents in the
    // collection.documentStructure rather than a database column

    if (sort === "index") {
      documentIds = collection.documentStructure.map(node => node.id).slice(ctx.state.pagination.offset, ctx.state.pagination.limit);
      where = { ...where,
        id: documentIds
      };
    } // otherwise, filter by all collections the user has access to

  } else {
    const collectionIds = await user.collectionIds();
    where = { ...where,
      collectionId: collectionIds
    };
  }

  if (parentDocumentId) {
    ctx.assertUuid(parentDocumentId, "parentDocumentId must be a UUID");
    where = { ...where,
      parentDocumentId
    };
  } // Explicitly passing 'null' as the parentDocumentId allows listing documents
  // that have no parent document (aka they are at the root of the collection)


  if (parentDocumentId === null) {
    where = { ...where,
      parentDocumentId: {
        [Op.eq]: null
      }
    };
  }

  if (backlinkDocumentId) {
    ctx.assertUuid(backlinkDocumentId, "backlinkDocumentId must be a UUID");
    const backlinks = await _models.Backlink.findAll({
      attributes: ["reverseDocumentId"],
      where: {
        documentId: backlinkDocumentId
      }
    });
    where = { ...where,
      id: backlinks.map(backlink => backlink.reverseDocumentId)
    };
  }

  if (sort === "index") {
    sort = "updatedAt";
  }

  ctx.assertSort(sort, _models.Document); // add the users starred state to the response by default

  const starredScope = {
    method: ["withStarred", user.id]
  };
  const collectionScope = {
    method: ["withCollection", user.id]
  };
  const viewScope = {
    method: ["withViews", user.id]
  };
  const documents = await _models.Document.scope("defaultScope", starredScope, collectionScope, viewScope).findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }); // index sort is special because it uses the order of the documents in the
  // collection.documentStructure rather than a database column

  if (documentIds.length) {
    documents.sort((a, b) => documentIds.indexOf(a.id) - documentIds.indexOf(b.id));
  }

  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.pinned", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const {
    collectionId,
    sort = "updatedAt"
  } = ctx.body;
  let direction = ctx.body.direction;
  if (direction !== "ASC") direction = "DESC";
  ctx.assertUuid(collectionId, "collectionId is required");
  ctx.assertSort(sort, _models.Document);
  const user = ctx.state.user;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(collectionId);
  authorize(user, "read", collection);
  const starredScope = {
    method: ["withStarred", user.id]
  };
  const collectionScope = {
    method: ["withCollection", user.id]
  };
  const viewScope = {
    method: ["withViews", user.id]
  };
  const documents = await _models.Document.scope("defaultScope", starredScope, collectionScope, viewScope).findAll({
    where: {
      teamId: user.teamId,
      collectionId,
      pinnedById: {
        [Op.ne]: null
      }
    },
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.archived", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const {
    sort = "updatedAt"
  } = ctx.body;
  ctx.assertSort(sort, _models.Document);
  let direction = ctx.body.direction;
  if (direction !== "ASC") direction = "DESC";
  const user = ctx.state.user;
  const collectionIds = await user.collectionIds();
  const collectionScope = {
    method: ["withCollection", user.id]
  };
  const viewScope = {
    method: ["withViews", user.id]
  };
  const documents = await _models.Document.scope("defaultScope", collectionScope, viewScope).findAll({
    where: {
      teamId: user.teamId,
      collectionId: collectionIds,
      archivedAt: {
        [Op.ne]: null
      }
    },
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.deleted", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const {
    sort = "deletedAt"
  } = ctx.body;
  ctx.assertSort(sort, _models.Document);
  let direction = ctx.body.direction;
  if (direction !== "ASC") direction = "DESC";
  const user = ctx.state.user;
  const collectionIds = await user.collectionIds({
    paranoid: false
  });
  const collectionScope = {
    method: ["withCollection", user.id]
  };
  const viewScope = {
    method: ["withViews", user.id]
  };
  const documents = await _models.Document.scope(collectionScope, viewScope).findAll({
    where: {
      teamId: user.teamId,
      collectionId: collectionIds,
      deletedAt: {
        [Op.ne]: null
      }
    },
    include: [{
      model: _models.User,
      as: "createdBy",
      paranoid: false
    }, {
      model: _models.User,
      as: "updatedBy",
      paranoid: false
    }],
    paranoid: false,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.viewed", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    sort = "updatedAt",
    direction
  } = ctx.body;
  ctx.assertSort(sort, _models.Document);
  if (direction !== "ASC") direction = "DESC";
  const user = ctx.state.user;
  const collectionIds = await user.collectionIds();
  const views = await _models.View.findAll({
    where: {
      userId: user.id
    },
    order: [[sort, direction]],
    include: [{
      model: _models.Document,
      required: true,
      where: {
        collectionId: collectionIds
      },
      include: [{
        model: _models.Star,
        as: "starred",
        where: {
          userId: user.id
        },
        required: false
      }]
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const documents = views.map(view => {
    const document = view.document;
    document.views = [view];
    return document;
  });
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.starred", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    sort = "updatedAt",
    direction
  } = ctx.body;
  ctx.assertSort(sort, _models.Document);
  if (direction !== "ASC") direction = "DESC";
  const user = ctx.state.user;
  const collectionIds = await user.collectionIds();
  const stars = await _models.Star.findAll({
    where: {
      userId: user.id
    },
    order: [[sort, direction]],
    include: [{
      model: _models.Document,
      where: {
        collectionId: collectionIds
      },
      include: [{
        model: _models.Collection,
        as: "collection"
      }, {
        model: _models.Star,
        as: "starred",
        where: {
          userId: user.id
        }
      }]
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const documents = stars.map(star => star.document);
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.drafts", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    collectionId,
    dateFilter,
    sort = "updatedAt",
    direction
  } = ctx.body;
  ctx.assertSort(sort, _models.Document);
  if (direction !== "ASC") direction = "DESC";
  const user = ctx.state.user;

  if (collectionId) {
    ctx.assertUuid(collectionId, "collectionId must be a UUID");
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    authorize(user, "read", collection);
  }

  const collectionIds = !!collectionId ? [collectionId] : await user.collectionIds();
  const whereConditions = {
    userId: user.id,
    collectionId: collectionIds,
    publishedAt: {
      [Op.eq]: null
    },
    updatedAt: undefined
  };

  if (dateFilter) {
    ctx.assertIn(dateFilter, ["day", "week", "month", "year"], "dateFilter must be one of day,week,month,year");
    whereConditions.updatedAt = {
      [Op.gte]: (0, _date.subtractDate)(new Date(), dateFilter)
    };
  } else {
    delete whereConditions.updatedAt;
  }

  const collectionScope = {
    method: ["withCollection", user.id]
  };
  const documents = await _models.Document.scope("defaultScope", collectionScope).findAll({
    where: whereConditions,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document)));
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});

async function loadDocument({
  id,
  shareId,
  user
}) {
  let document;
  let collection;
  let share;

  if (shareId) {
    share = await _models.Share.findOne({
      where: {
        revokedAt: {
          [Op.eq]: null
        },
        id: shareId
      },
      include: [{
        // unscoping here allows us to return unpublished documents
        model: _models.Document.unscoped(),
        include: [{
          model: _models.User,
          as: "createdBy",
          paranoid: false
        }, {
          model: _models.User,
          as: "updatedBy",
          paranoid: false
        }],
        required: true,
        as: "document"
      }]
    });

    if (!share || share.document.archivedAt) {
      throw new _errors.InvalidRequestError("Document could not be found for shareId");
    } // It is possible to pass both an id and a shareId to the documents.info
    // endpoint. In this case we'll load the document based on the `id` and check
    // if the provided share token allows access. This is used by the frontend
    // to navigate nested documents from a single share link.


    if (id) {
      document = await _models.Document.findByPk(id, {
        userId: user ? user.id : undefined,
        paranoid: false
      }); // otherwise, if the user has an authenticated session make sure to load
      // with their details so that we can return the correct policies, they may
      // be able to edit the shared document
    } else if (user) {
      document = await _models.Document.findByPk(share.documentId, {
        userId: user.id,
        paranoid: false
      });
    } else {
      document = share.document;
    } // "published" === on the public internet. So if the share isn't published
    // then we must have permission to read the document


    if (!share.published) {
      authorize(user, "read", document);
    } // It is possible to disable sharing at the collection so we must check


    collection = await _models.Collection.findByPk(document.collectionId);

    if (!collection.sharing) {
      throw new _errors.AuthorizationError();
    } // If we're attempting to load a document that isn't the document originally
    // shared then includeChildDocuments must be enabled and the document must
    // still be nested within the shared document


    if (share.document.id !== document.id) {
      if (!share.includeChildDocuments || !collection.isChildDocument(share.document.id, document.id)) {
        throw new _errors.AuthorizationError();
      }
    } // It is possible to disable sharing at the team level so we must check


    const team = await _models.Team.findByPk(document.teamId);

    if (!team.sharing) {
      throw new _errors.AuthorizationError();
    }

    await share.update({
      lastAccessedAt: new Date()
    });
  } else {
    document = await _models.Document.findByPk(id, {
      userId: user ? user.id : undefined,
      paranoid: false
    });

    if (!document) {
      throw new _errors.NotFoundError();
    }

    if (document.deletedAt) {
      authorize(user, "restore", document);
    } else {
      authorize(user, "read", document);
    }

    collection = document.collection;
  }

  return {
    document,
    share,
    collection
  };
}

router.post("documents.info", (0, _authentication.default)({
  required: false
}), async ctx => {
  const {
    id,
    shareId,
    apiVersion
  } = ctx.body;
  ctx.assertPresent(id || shareId, "id or shareId is required");
  const {
    user
  } = ctx.state;
  const {
    document,
    share,
    collection
  } = await loadDocument({
    id,
    shareId,
    user
  });
  const isPublic = cannot(user, "read", document);
  const serializedDocument = await (0, _presenters.presentDocument)(document, {
    isPublic
  }); // Passing apiVersion=2 has a single effect, to change the response payload to
  // include document and sharedTree keys.

  const data = apiVersion === 2 ? {
    document: serializedDocument,
    sharedTree: share && share.includeChildDocuments ? collection.getDocumentTree(share.documentId) : undefined
  } : serializedDocument;
  ctx.body = {
    data,
    policies: isPublic ? undefined : (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.export", (0, _authentication.default)({
  required: false
}), async ctx => {
  const {
    id,
    shareId
  } = ctx.body;
  ctx.assertPresent(id || shareId, "id or shareId is required");
  const user = ctx.state.user;
  const {
    document
  } = await loadDocument({
    id,
    shareId,
    user
  });
  ctx.body = {
    data: document.toMarkdown()
  };
});
router.post("documents.restore", (0, _authentication.default)(), async ctx => {
  const {
    id,
    collectionId,
    revisionId
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    paranoid: false
  });

  if (!document) {
    throw new _errors.NotFoundError();
  } // Passing collectionId allows restoring to a different collection than the
  // document was originally within


  if (collectionId) {
    ctx.assertUuid(collectionId, "collectionId must be a uuid");
    document.collectionId = collectionId;
  }

  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(document.collectionId); // if the collectionId was provided in the request and isn't valid then it will
  // be caught as a 403 on the authorize call below. Otherwise we're checking here
  // that the original collection still exists and advising to pass collectionId
  // if not.

  if (!collectionId) {
    ctx.assertPresent(collection, "collectionId is required");
  }

  authorize(user, "update", collection);

  if (document.deletedAt) {
    authorize(user, "restore", document); // restore a previously deleted document

    await document.unarchive(user.id);
    await _models.Event.create({
      name: "documents.restore",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        title: document.title
      },
      ip: ctx.request.ip
    });
  } else if (document.archivedAt) {
    authorize(user, "unarchive", document); // restore a previously archived document

    await document.unarchive(user.id);
    await _models.Event.create({
      name: "documents.unarchive",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        title: document.title
      },
      ip: ctx.request.ip
    });
  } else if (revisionId) {
    // restore a document to a specific revision
    authorize(user, "update", document);
    const revision = await _models.Revision.findByPk(revisionId);
    authorize(document, "restore", revision);
    document.text = revision.text;
    document.title = revision.title;
    await document.save();
    await _models.Event.create({
      name: "documents.restore",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        title: document.title
      },
      ip: ctx.request.ip
    });
  } else {
    ctx.assertPresent(revisionId, "revisionId is required");
  }

  ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.search_titles", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const {
    query
  } = ctx.body;
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const user = ctx.state.user;
  ctx.assertPresent(query, "query is required");
  const collectionIds = await user.collectionIds();
  const documents = await _models.Document.scope({
    method: ["withViews", user.id]
  }, {
    method: ["withCollection", user.id]
  }).findAll({
    where: {
      title: {
        [Op.iLike]: `%${query}%`
      },
      collectionId: collectionIds,
      archivedAt: {
        [Op.eq]: null
      }
    },
    order: [["updatedAt", "DESC"]],
    include: [{
      model: _models.User,
      as: "createdBy",
      paranoid: false
    }, {
      model: _models.User,
      as: "updatedBy",
      paranoid: false
    }],
    offset,
    limit
  });
  const policies = (0, _presenters.presentPolicies)(user, documents);
  const data = await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document)));
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.search", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const {
    query,
    includeArchived,
    includeDrafts,
    collectionId,
    userId,
    dateFilter
  } = ctx.body;
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const user = ctx.state.user;
  ctx.assertPresent(query, "query is required");

  if (collectionId) {
    ctx.assertUuid(collectionId, "collectionId must be a UUID");
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    authorize(user, "read", collection);
  }

  let collaboratorIds = undefined;

  if (userId) {
    ctx.assertUuid(userId, "userId must be a UUID");
    collaboratorIds = [userId];
  }

  if (dateFilter) {
    ctx.assertIn(dateFilter, ["day", "week", "month", "year"], "dateFilter must be one of day,week,month,year");
  }

  const {
    results,
    totalCount
  } = await _models.Document.searchForUser(user, query, {
    includeArchived: includeArchived === "true",
    includeDrafts: includeDrafts === "true",
    collaboratorIds,
    collectionId,
    dateFilter,
    offset,
    limit
  });
  const documents = results.map(result => result.document);
  const data = await Promise.all(results.map(async result => {
    const document = await (0, _presenters.presentDocument)(result.document);
    return { ...result,
      document
    };
  })); // When requesting subsequent pages of search results we don't want to record
  // duplicate search query records

  if (offset === 0) {
    _models.SearchQuery.create({
      userId: user.id,
      teamId: user.teamId,
      source: ctx.state.authType,
      query,
      results: totalCount
    });
  }

  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.pin", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "pin", document);
  document.pinnedById = user.id;
  await document.save();
  await _models.Event.create({
    name: "documents.pin",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      title: document.title
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.unpin", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "unpin", document);
  document.pinnedById = null;
  await document.save();
  await _models.Event.create({
    name: "documents.unpin",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      title: document.title
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.star", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "read", document);
  await _models.Star.findOrCreate({
    where: {
      documentId: document.id,
      userId: user.id
    }
  });
  await _models.Event.create({
    name: "documents.star",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      title: document.title
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("documents.unstar", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "read", document);
  await _models.Star.destroy({
    where: {
      documentId: document.id,
      userId: user.id
    }
  });
  await _models.Event.create({
    name: "documents.unstar",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      title: document.title
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("documents.templatize", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const original = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "update", original);
  let document = await _models.Document.create({
    editorVersion: original.editorVersion,
    collectionId: original.collectionId,
    teamId: original.teamId,
    userId: user.id,
    publishedAt: new Date(),
    lastModifiedById: user.id,
    createdById: user.id,
    template: true,
    title: original.title,
    text: original.text
  });
  await _models.Event.create({
    name: "documents.create",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      title: document.title,
      template: true
    },
    ip: ctx.request.ip
  }); // reload to get all of the data needed to present (user, collection etc)

  document = await _models.Document.findByPk(document.id, {
    userId: user.id
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.update", (0, _authentication.default)(), async ctx => {
  const {
    id,
    title,
    text,
    publish,
    autosave,
    done,
    lastRevision,
    templateId,
    append
  } = ctx.body;
  const editorVersion = ctx.headers["x-editor-version"];
  ctx.assertPresent(id, "id is required");
  ctx.assertPresent(title || text, "title or text is required");
  if (append) ctx.assertPresent(text, "Text is required while appending");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "update", document);

  if (lastRevision && lastRevision !== document.revisionCount) {
    throw new _errors.InvalidRequestError("Document has changed since last revision");
  }

  const previousTitle = document.title; // Update document

  if (title) document.title = title;
  if (editorVersion) document.editorVersion = editorVersion;
  if (templateId) document.templateId = templateId;

  if (append) {
    document.text += text;
  } else if (text !== undefined) {
    document.text = text;
  }

  document.lastModifiedById = user.id;
  const {
    collection
  } = document;
  let transaction;

  try {
    transaction = await _sequelize2.sequelize.transaction();

    if (publish) {
      await document.publish(user.id, {
        transaction
      });
    } else {
      await document.save({
        autosave,
        transaction
      });
    }

    await transaction.commit();
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }

    throw err;
  }

  if (publish) {
    await _models.Event.create({
      name: "documents.publish",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        title: document.title
      },
      ip: ctx.request.ip
    });
  } else {
    await _models.Event.create({
      name: "documents.update",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        autosave,
        done,
        title: document.title
      },
      ip: ctx.request.ip
    });
  }

  if (document.title !== previousTitle) {
    _models.Event.add({
      name: "documents.title_change",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        previousTitle,
        title: document.title
      },
      ip: ctx.request.ip
    });
  }

  document.updatedBy = user;
  document.collection = collection;
  ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.move", (0, _authentication.default)(), async ctx => {
  const {
    id,
    collectionId,
    parentDocumentId,
    index
  } = ctx.body;
  ctx.assertUuid(id, "id must be a uuid");
  ctx.assertUuid(collectionId, "collectionId must be a uuid");

  if (parentDocumentId) {
    ctx.assertUuid(parentDocumentId, "parentDocumentId must be a uuid");
  }

  if (index) {
    ctx.assertPositiveInteger(index, "index must be a positive integer");
  }

  if (parentDocumentId === id) {
    throw new _errors.InvalidRequestError("Infinite loop detected, cannot nest a document inside itself");
  }

  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "move", document);
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(collectionId);
  authorize(user, "update", collection);

  if (parentDocumentId) {
    const parent = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id
    });
    authorize(user, "update", parent);
  }

  const {
    documents,
    collections,
    collectionChanged
  } = await (0, _documentMover.default)({
    user,
    document,
    collectionId,
    parentDocumentId,
    index,
    ip: ctx.request.ip
  });
  ctx.body = {
    data: {
      documents: await Promise.all(documents.map(document => (0, _presenters.presentDocument)(document))),
      collections: await Promise.all(collections.map(collection => (0, _presenters.presentCollection)(collection)))
    },
    policies: collectionChanged ? (0, _presenters.presentPolicies)(user, documents) : []
  };
});
router.post("documents.archive", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "archive", document);
  await document.archive(user.id);
  await _models.Event.create({
    name: "documents.archive",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      title: document.title
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.delete", (0, _authentication.default)(), async ctx => {
  const {
    id,
    permanent
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;

  if (permanent) {
    const document = await _models.Document.findByPk(id, {
      userId: user.id,
      paranoid: false
    });
    authorize(user, "permanentDelete", document);
    await _models.Document.update({
      parentDocumentId: null
    }, {
      where: {
        parentDocumentId: document.id
      },
      paranoid: false
    });
    await (0, _documentPermanentDeleter.documentPermanentDeleter)([document]);
    await _models.Event.create({
      name: "documents.permanent_delete",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        title: document.title
      },
      ip: ctx.request.ip
    });
  } else {
    const document = await _models.Document.findByPk(id, {
      userId: user.id
    });
    authorize(user, "delete", document);
    await document.delete(user.id);
    await _models.Event.create({
      name: "documents.delete",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        title: document.title
      },
      ip: ctx.request.ip
    });
  }

  ctx.body = {
    success: true
  };
});
router.post("documents.unpublish", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  authorize(user, "unpublish", document);
  await document.unpublish(user.id);
  await _models.Event.create({
    name: "documents.unpublish",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      title: document.title
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.import", (0, _authentication.default)(), async ctx => {
  const {
    publish,
    collectionId,
    parentDocumentId,
    index
  } = ctx.body;

  if (!ctx.is("multipart/form-data")) {
    throw new _errors.InvalidRequestError("Request type must be multipart/form-data");
  }

  const file = Object.values(ctx.request.files)[0];
  ctx.assertPresent(file, "file is required");

  if (file.size > _env.default.MAXIMUM_IMPORT_SIZE) {
    throw new _errors.InvalidRequestError("The selected file was too large to import");
  }

  ctx.assertUuid(collectionId, "collectionId must be an uuid");

  if (parentDocumentId) {
    ctx.assertUuid(parentDocumentId, "parentDocumentId must be an uuid");
  }

  if (index) ctx.assertPositiveInteger(index, "index must be an integer (>=0)");
  const user = ctx.state.user;
  authorize(user, "createDocument", user.team);
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findOne({
    where: {
      id: collectionId,
      teamId: user.teamId
    }
  });
  authorize(user, "publish", collection);
  let parentDocument;

  if (parentDocumentId) {
    parentDocument = await _models.Document.findOne({
      where: {
        id: parentDocumentId,
        collectionId: collection.id
      }
    });
    authorize(user, "read", parentDocument, {
      collection
    });
  }

  const {
    text,
    title
  } = await (0, _documentImporter.default)({
    user,
    file,
    ip: ctx.request.ip
  });
  const document = await (0, _documentCreator.default)({
    source: "import",
    title,
    text,
    publish,
    collectionId,
    parentDocumentId,
    index,
    user,
    ip: ctx.request.ip
  });
  document.collection = collection;
  return ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.create", (0, _authentication.default)(), async ctx => {
  const {
    title = "",
    text = "",
    publish,
    collectionId,
    parentDocumentId,
    templateId,
    template,
    index
  } = ctx.body;
  const editorVersion = ctx.headers["x-editor-version"];
  ctx.assertUuid(collectionId, "collectionId must be an uuid");

  if (parentDocumentId) {
    ctx.assertUuid(parentDocumentId, "parentDocumentId must be an uuid");
  }

  if (index) ctx.assertPositiveInteger(index, "index must be an integer (>=0)");
  const user = ctx.state.user;
  authorize(user, "createDocument", user.team);
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findOne({
    where: {
      id: collectionId,
      teamId: user.teamId
    }
  });
  authorize(user, "publish", collection);
  let parentDocument;

  if (parentDocumentId) {
    parentDocument = await _models.Document.findOne({
      where: {
        id: parentDocumentId,
        collectionId: collection.id
      }
    });
    authorize(user, "read", parentDocument, {
      collection
    });
  }

  let templateDocument;

  if (templateId) {
    templateDocument = await _models.Document.findByPk(templateId, {
      userId: user.id
    });
    authorize(user, "read", templateDocument);
  }

  const document = await (0, _documentCreator.default)({
    title,
    text,
    publish,
    collectionId,
    parentDocumentId,
    templateDocument,
    template,
    index,
    user,
    editorVersion,
    ip: ctx.request.ip
  });
  document.collection = collection;
  return ctx.body = {
    data: await (0, _presenters.presentDocument)(document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
var _default = router;
exports.default = _default;