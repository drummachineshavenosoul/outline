"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

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
router.post("apiKeys.create", (0, _authentication.default)(), async ctx => {
  const {
    name
  } = ctx.body;
  ctx.assertPresent(name, "name is required");
  const user = ctx.state.user;
  authorize(user, "createApiKey", user.team);
  const key = await _models.ApiKey.create({
    name,
    userId: user.id
  });
  await _models.Event.create({
    name: "api_keys.create",
    modelId: key.id,
    teamId: user.teamId,
    actorId: user.id,
    data: {
      name
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: (0, _presenters.presentApiKey)(key)
  };
});
router.post("apiKeys.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const user = ctx.state.user;
  const keys = await _models.ApiKey.findAll({
    where: {
      userId: user.id
    },
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: keys.map(_presenters.presentApiKey)
  };
});
router.post("apiKeys.delete", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const key = await _models.ApiKey.findByPk(id);
  authorize(user, "delete", key);
  await key.destroy();
  await _models.Event.create({
    name: "api_keys.delete",
    modelId: key.id,
    teamId: user.teamId,
    actorId: user.id,
    data: {
      name: key.name
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
var _default = router;
exports.default = _default;