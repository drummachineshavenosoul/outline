"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _providers = _interopRequireDefault(require("../auth/providers"));

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _policies = _interopRequireDefault(require("../policies"));

var _presenters = require("../presenters");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = new _koaRouter.default();
const {
  authorize
} = _policies.default;
router.post("authenticationProviders.info", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const authenticationProvider = await _models.AuthenticationProvider.findByPk(id);
  authorize(user, "read", authenticationProvider);
  ctx.body = {
    data: (0, _presenters.presentAuthenticationProvider)(authenticationProvider),
    policies: (0, _presenters.presentPolicies)(user, [authenticationProvider])
  };
});
router.post("authenticationProviders.update", (0, _authentication.default)(), async ctx => {
  const {
    id,
    isEnabled
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  ctx.assertPresent(isEnabled, "isEnabled is required");
  const user = ctx.state.user;
  const authenticationProvider = await _models.AuthenticationProvider.findByPk(id);
  authorize(user, "update", authenticationProvider);
  const enabled = !!isEnabled;

  if (enabled) {
    await authenticationProvider.enable();
  } else {
    await authenticationProvider.disable();
  }

  await _models.Event.create({
    name: "authenticationProviders.update",
    data: {
      enabled
    },
    modelId: id,
    teamId: user.teamId,
    actorId: user.id,
    ip: ctx.request.ip
  });
  ctx.body = {
    data: (0, _presenters.presentAuthenticationProvider)(authenticationProvider),
    policies: (0, _presenters.presentPolicies)(user, [authenticationProvider])
  };
});
router.post("authenticationProviders.list", (0, _authentication.default)(), async ctx => {
  const user = ctx.state.user;
  authorize(user, "read", user.team);
  const teamAuthenticationProviders = await user.team.getAuthenticationProviders();

  const otherAuthenticationProviders = _providers.default.filter(p => !teamAuthenticationProviders.find(t => t.name === p.id) && p.enabled && // email auth is dealt with separetly right now, although it definitely
  // wants to be here in the future – we'll need to migrate more data though
  p.id !== "email");

  ctx.body = {
    data: {
      authenticationProviders: [...teamAuthenticationProviders.map(_presenters.presentAuthenticationProvider), ...otherAuthenticationProviders.map(p => ({
        name: p.id,
        isEnabled: false,
        isConnected: false
      }))]
    }
  };
});
var _default = router;
exports.default = _default;