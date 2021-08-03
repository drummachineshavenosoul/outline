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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  authorize
} = _policies.default;
const router = new _koaRouter.default();
router.post("views.list", (0, _authentication.default)(), async ctx => {
  const {
    documentId
  } = ctx.body;
  ctx.assertUuid(documentId, "documentId is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  authorize(user, "read", document);
  const views = await _models.View.findByDocument(documentId);
  ctx.body = {
    data: views.map(_presenters.presentView)
  };
});
router.post("views.create", (0, _authentication.default)(), async ctx => {
  const {
    documentId
  } = ctx.body;
  ctx.assertUuid(documentId, "documentId is required");
  const user = ctx.state.user;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id
  });
  authorize(user, "read", document);
  const view = await _models.View.increment({
    documentId,
    userId: user.id
  });
  await _models.Event.create({
    name: "views.create",
    actorId: user.id,
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: user.teamId,
    data: {
      title: document.title
    },
    ip: ctx.request.ip
  });
  view.user = user;
  ctx.body = {
    data: (0, _presenters.presentView)(view)
  };
});
var _default = router;
exports.default = _default;