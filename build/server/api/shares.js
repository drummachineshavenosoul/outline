"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _errors = require("../errors");

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _policies = _interopRequireDefault(require("../policies"));

var _presenters = require("../presenters");

var _pagination = _interopRequireDefault(require("./middlewares/pagination"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Op = _sequelize.default.Op;
const {
  authorize
} = _policies.default;
const router = new _koaRouter.default();
router.post("shares.info", (0, _authentication.default)(), async ctx => {
  const {
    id,
    documentId,
    apiVersion
  } = ctx.body;
  ctx.assertUuid(id || documentId, "id or documentId is required");
  const user = ctx.state.user;
  let shares = [];
  let share = await _models.Share.findOne({
    where: id ? {
      id,
      revokedAt: {
        [Op.eq]: null
      }
    } : {
      documentId,
      teamId: user.teamId,
      revokedAt: {
        [Op.eq]: null
      }
    }
  }); // Deprecated API response returns just the share for the current documentId

  if (apiVersion !== 2) {
    if (!share || !share.document) {
      return ctx.response.status = 204;
    }

    authorize(user, "read", share);
    ctx.body = {
      data: (0, _presenters.presentShare)(share, user.isAdmin),
      policies: (0, _presenters.presentPolicies)(user, [share])
    };
    return;
  } // API version 2 returns the response for the current documentId and any
  // parent documents that are publicly shared and accessible to the user


  if (share && share.document) {
    authorize(user, "read", share);
    shares.push(share);
  }

  if (documentId) {
    var _document$collection;

    const document = await _models.Document.scope("withCollection").findByPk(documentId);
    const parentIds = document === null || document === void 0 ? void 0 : (_document$collection = document.collection) === null || _document$collection === void 0 ? void 0 : _document$collection.getDocumentParents(documentId);
    const parentShare = parentIds ? await _models.Share.findOne({
      where: {
        documentId: parentIds,
        teamId: user.teamId,
        revokedAt: {
          [Op.eq]: null
        },
        includeChildDocuments: true,
        published: true
      }
    }) : undefined;

    if (parentShare && parentShare.document) {
      authorize(user, "read", parentShare);
      shares.push(parentShare);
    }
  }

  if (!shares.length) {
    return ctx.response.status = 204;
  }

  ctx.body = {
    data: {
      shares: shares.map(share => (0, _presenters.presentShare)(share, user.isAdmin))
    },
    policies: (0, _presenters.presentPolicies)(user, shares)
  };
});
router.post("shares.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    sort = "updatedAt",
    direction
  } = ctx.body;
  if (direction !== "ASC") direction = "DESC";
  ctx.assertSort(sort, _models.Share);
  const user = ctx.state.user;
  const where = {
    teamId: user.teamId,
    userId: user.id,
    published: true,
    revokedAt: {
      [Op.eq]: null
    }
  };

  if (user.isAdmin) {
    delete where.userId;
  }

  const collectionIds = await user.collectionIds();
  const shares = await _models.Share.findAll({
    where,
    order: [[sort, direction]],
    include: [{
      model: _models.Document,
      required: true,
      paranoid: true,
      as: "document",
      where: {
        collectionId: collectionIds
      }
    }, {
      model: _models.User,
      required: true,
      as: "user"
    }, {
      model: _models.Team,
      required: true,
      as: "team"
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: shares.map(share => (0, _presenters.presentShare)(share, user.isAdmin)),
    policies: (0, _presenters.presentPolicies)(user, shares)
  };
});
router.post("shares.update", (0, _authentication.default)(), async ctx => {
  const {
    id,
    includeChildDocuments,
    published
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const {
    user
  } = ctx.state;
  const share = await _models.Share.findByPk(id);
  authorize(user, "update", share);

  if (published !== undefined) {
    share.published = published; // Reset nested document sharing when unpublishing a share link. So that
    // If it's ever re-published this doesn't immediately share nested docs
    // without forewarning the user

    if (!published) {
      share.includeChildDocuments = false;
    }
  }

  if (includeChildDocuments !== undefined) {
    share.includeChildDocuments = includeChildDocuments;
  }

  await share.save();
  await _models.Event.create({
    name: "shares.update",
    documentId: share.documentId,
    modelId: share.id,
    teamId: user.teamId,
    actorId: user.id,
    data: {
      published
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: (0, _presenters.presentShare)(share, user.isAdmin),
    policies: (0, _presenters.presentPolicies)(user, [share])
  };
});
router.post("shares.create", (0, _authentication.default)(), async ctx => {
  const {
    documentId
  } = ctx.body;
  ctx.assertPresent(documentId, "documentId is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  const team = await _models.Team.findByPk(user.teamId);
  authorize(user, "share", document);
  authorize(user, "share", team);
  const [share, isCreated] = await _models.Share.findOrCreate({
    where: {
      documentId,
      teamId: user.teamId,
      revokedAt: null
    },
    defaults: {
      userId: user.id
    }
  });

  if (isCreated) {
    await _models.Event.create({
      name: "shares.create",
      documentId,
      collectionId: document.collectionId,
      modelId: share.id,
      teamId: user.teamId,
      actorId: user.id,
      data: {
        name: document.title
      },
      ip: ctx.request.ip
    });
  }

  share.team = team;
  share.user = user;
  share.document = document;
  ctx.body = {
    data: (0, _presenters.presentShare)(share),
    policies: (0, _presenters.presentPolicies)(user, [share])
  };
});
router.post("shares.revoke", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const share = await _models.Share.findByPk(id);
  authorize(user, "revoke", share);
  const document = await _models.Document.findByPk(share.documentId);

  if (!document) {
    throw new _errors.NotFoundError();
  }

  await share.revoke(user.id);
  await _models.Event.create({
    name: "shares.revoke",
    documentId: document.id,
    collectionId: document.collectionId,
    modelId: share.id,
    teamId: user.teamId,
    actorId: user.id,
    data: {
      name: document.title
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
var _default = router;
exports.default = _default;