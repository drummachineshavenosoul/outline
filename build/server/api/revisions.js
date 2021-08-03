"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _errors = require("../errors");

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _policies = _interopRequireDefault(require("../policies"));

var _presenters = require("../presenters");

var _pagination = _interopRequireDefault(require("./middlewares/pagination"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  authorize
} = _policies.default;
const router = new _koaRouter.default();
router.post("revisions.info", (0, _authentication.default)(), async ctx => {
  let {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const revision = await _models.Revision.findByPk(id);

  if (!revision) {
    throw new _errors.NotFoundError();
  }

  const document = await _models.Document.findByPk(revision.documentId, {
    userId: user.id
  });
  authorize(user, "read", document);
  ctx.body = {
    pagination: ctx.state.pagination,
    data: await (0, _presenters.presentRevision)(revision)
  };
});
router.post("revisions.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    documentId,
    sort = "updatedAt",
    direction
  } = ctx.body;
  if (direction !== "ASC") direction = "DESC";
  ctx.assertSort(sort, _models.Revision);
  ctx.assertPresent(documentId, "documentId is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  authorize(user, "read", document);
  const revisions = await _models.Revision.findAll({
    where: {
      documentId: document.id
    },
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await Promise.all(revisions.map(revision => (0, _presenters.presentRevision)(revision)));
  ctx.body = {
    pagination: ctx.state.pagination,
    data
  };
});
var _default = router;
exports.default = _default;