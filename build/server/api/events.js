"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _sequelize = _interopRequireDefault(require("sequelize"));

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
router.post("events.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const user = ctx.state.user;
  let {
    sort = "createdAt",
    actorId,
    documentId,
    collectionId,
    direction,
    name,
    auditLog = false
  } = ctx.body;
  if (direction !== "ASC") direction = "DESC";
  ctx.assertSort(sort, _models.Event);
  let where = {
    name: _models.Event.ACTIVITY_EVENTS,
    teamId: user.teamId
  };

  if (actorId) {
    ctx.assertUuid(actorId, "actorId must be a UUID");
    where = { ...where,
      actorId
    };
  }

  if (documentId) {
    ctx.assertUuid(documentId, "documentId must be a UUID");
    where = { ...where,
      documentId
    };
  }

  if (collectionId) {
    ctx.assertUuid(collectionId, "collection must be a UUID");
    where = { ...where,
      collectionId
    };
    const collection = await _models.Collection.scope({
      method: ["withMembership", user.id]
    }).findByPk(collectionId);
    authorize(user, "read", collection);
  } else {
    const collectionIds = await user.collectionIds({
      paranoid: false
    });
    where = { ...where,
      [Op.or]: [{
        collectionId: collectionIds
      }, {
        collectionId: {
          [Op.eq]: null
        }
      }]
    };
  }

  if (auditLog) {
    authorize(user, "manage", user.team);
    where.name = _models.Event.AUDIT_EVENTS;
  }

  if (name && where.name.includes(name)) {
    where.name = name;
  }

  const events = await _models.Event.findAll({
    where,
    order: [[sort, direction]],
    include: [{
      model: _models.User,
      as: "actor",
      paranoid: false
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: events.map(event => (0, _presenters.presentEvent)(event, auditLog))
  };
});
var _default = router;
exports.default = _default;