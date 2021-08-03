"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));

var _dateFns = require("date-fns");

var _debug = _interopRequireDefault(require("debug"));

var _koa = _interopRequireDefault(require("koa"));

var _koaBody = _interopRequireDefault(require("koa-body"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _errors = require("../errors");

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _validation = _interopRequireDefault(require("../middlewares/validation"));

var _models = require("../models");

var _providers = _interopRequireDefault(require("./providers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug.default)("server");
const app = new _koa.default();
const router = new _koaRouter.default();
router.use(_koaPassport.default.initialize()); // dynamically load available authentication provider routes

_providers.default.forEach(provider => {
  if (provider.enabled) {
    router.use("/", provider.router.routes());
    log(`loaded ${provider.name} auth provider`);
  }
});

router.get("/redirect", (0, _authentication.default)(), async ctx => {
  const user = ctx.state.user;
  const jwtToken = user.getJwtToken();

  if (jwtToken === ctx.params.token) {
    throw new _errors.AuthenticationError("Cannot extend token");
  } // ensure that the lastActiveAt on user is updated to prevent replay requests


  await user.updateActiveAt(ctx.request.ip, true);
  ctx.cookies.set("accessToken", jwtToken, {
    httpOnly: false,
    expires: (0, _dateFns.addMonths)(new Date(), 3)
  });
  const [team, collection, view] = await Promise.all([_models.Team.findByPk(user.teamId), _models.Collection.findOne({
    where: {
      teamId: user.teamId
    }
  }), _models.View.findOne({
    where: {
      userId: user.id
    }
  })]);
  const hasViewedDocuments = !!view;
  ctx.redirect(!hasViewedDocuments && collection ? `${team.url}${collection.url}` : `${team.url}/home`);
});
app.use((0, _koaBody.default)());
app.use((0, _validation.default)());
app.use(router.routes());
var _default = app;
exports.default = _default;