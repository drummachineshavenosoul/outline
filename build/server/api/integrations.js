"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _Integration = _interopRequireDefault(require("../models/Integration"));

var _policies = _interopRequireDefault(require("../policies"));

var _presenters = require("../presenters");

var _pagination = _interopRequireDefault(require("./middlewares/pagination"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  authorize
} = _policies.default;
const router = new _koaRouter.default();
router.post("integrations.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    sort = "updatedAt",
    direction
  } = ctx.body;
  if (direction !== "ASC") direction = "DESC";
  ctx.assertSort(sort, _Integration.default);
  const user = ctx.state.user;
  const integrations = await _Integration.default.findAll({
    where: {
      teamId: user.teamId
    },
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: integrations.map(_presenters.presentIntegration)
  };
});
router.post("integrations.delete", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const integration = await _Integration.default.findByPk(id);
  authorize(user, "delete", integration);
  await integration.destroy();
  await _models.Event.create({
    name: "integrations.delete",
    modelId: integration.id,
    teamId: integration.teamId,
    actorId: user.id,
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
var _default = router;
exports.default = _default;