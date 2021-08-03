"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.config = void 0;

var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _passportSlackOauth = require("passport-slack-oauth2");

var _accountProvisioner = _interopRequireDefault(require("../../commands/accountProvisioner"));

var _env = _interopRequireDefault(require("../../env"));

var _authentication = _interopRequireDefault(require("../../middlewares/authentication"));

var _passport = _interopRequireDefault(require("../../middlewares/passport"));

var _models = require("../../models");

var Slack = _interopRequireWildcard(require("../../slack"));

var _passport2 = require("../../utils/passport");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = new _koaRouter.default();
const providerName = "slack";
const SLACK_CLIENT_ID = process.env.SLACK_KEY;
const SLACK_CLIENT_SECRET = process.env.SLACK_SECRET;
const scopes = ["identity.email", "identity.basic", "identity.avatar", "identity.team"];
const config = {
  name: "Slack",
  enabled: !!SLACK_CLIENT_ID
};
exports.config = config;

if (SLACK_CLIENT_ID) {
  const strategy = new _passportSlackOauth.Strategy({
    clientID: SLACK_CLIENT_ID,
    clientSecret: SLACK_CLIENT_SECRET,
    callbackURL: `${_env.default.URL}/auth/slack.callback`,
    passReqToCallback: true,
    store: new _passport2.StateStore(),
    scope: scopes
  }, async function (req, accessToken, refreshToken, profile, done) {
    try {
      const result = await (0, _accountProvisioner.default)({
        ip: req.ip,
        team: {
          name: profile.team.name,
          subdomain: profile.team.domain,
          avatarUrl: profile.team.image_230
        },
        user: {
          name: profile.user.name,
          email: profile.user.email,
          avatarUrl: profile.user.image_192
        },
        authenticationProvider: {
          name: providerName,
          providerId: profile.team.id
        },
        authentication: {
          providerId: profile.user.id,
          accessToken,
          refreshToken,
          scopes
        }
      });
      return done(null, result.user, result);
    } catch (err) {
      return done(err, null);
    }
  }); // For some reason the author made the strategy name capatilised, I don't know
  // why but we need everything lowercase so we just monkey-patch it here.

  strategy.name = providerName;

  _koaPassport.default.use(strategy);

  router.get("slack", _koaPassport.default.authenticate(providerName));
  router.get("slack.callback", (0, _passport.default)(providerName));
  router.get("slack.commands", (0, _authentication.default)({
    required: false
  }), async ctx => {
    const {
      code,
      state,
      error
    } = ctx.request.query;
    const user = ctx.state.user;
    ctx.assertPresent(code || error, "code is required");

    if (error) {
      ctx.redirect(`/settings/integrations/slack?error=${error}`);
      return;
    } // this code block accounts for the root domain being unable to
    // access authentication for subdomains. We must forward to the appropriate
    // subdomain to complete the oauth flow


    if (!user) {
      if (state) {
        try {
          const team = await _models.Team.findByPk(state);
          return ctx.redirect(`${team.url}/auth${ctx.request.path}?${ctx.request.querystring}`);
        } catch (err) {
          return ctx.redirect(`/settings/integrations/slack?error=unauthenticated`);
        }
      } else {
        return ctx.redirect(`/settings/integrations/slack?error=unauthenticated`);
      }
    }

    const endpoint = `${process.env.URL || ""}/auth/slack.commands`;
    const data = await Slack.oauthAccess(code, endpoint);
    const authentication = await _models.IntegrationAuthentication.create({
      service: "slack",
      userId: user.id,
      teamId: user.teamId,
      token: data.access_token,
      scopes: data.scope.split(",")
    });
    await _models.Integration.create({
      service: "slack",
      type: "command",
      userId: user.id,
      teamId: user.teamId,
      authenticationId: authentication.id,
      settings: {
        serviceTeamId: data.team_id
      }
    });
    ctx.redirect("/settings/integrations/slack");
  });
  router.get("slack.post", (0, _authentication.default)({
    required: false
  }), async ctx => {
    const {
      code,
      error,
      state
    } = ctx.request.query;
    const user = ctx.state.user;
    ctx.assertPresent(code || error, "code is required");
    const collectionId = state;
    ctx.assertUuid(collectionId, "collectionId must be an uuid");

    if (error) {
      ctx.redirect(`/settings/integrations/slack?error=${error}`);
      return;
    } // this code block accounts for the root domain being unable to
    // access authentication for subdomains. We must forward to the
    // appropriate subdomain to complete the oauth flow


    if (!user) {
      try {
        const collection = await _models.Collection.findByPk(state);
        const team = await _models.Team.findByPk(collection.teamId);
        return ctx.redirect(`${team.url}/auth${ctx.request.path}?${ctx.request.querystring}`);
      } catch (err) {
        return ctx.redirect(`/settings/integrations/slack?error=unauthenticated`);
      }
    }

    const endpoint = `${process.env.URL || ""}/auth/slack.post`;
    const data = await Slack.oauthAccess(code, endpoint);
    const authentication = await _models.IntegrationAuthentication.create({
      service: "slack",
      userId: user.id,
      teamId: user.teamId,
      token: data.access_token,
      scopes: data.scope.split(",")
    });
    await _models.Integration.create({
      service: "slack",
      type: "post",
      userId: user.id,
      teamId: user.teamId,
      authenticationId: authentication.id,
      collectionId,
      events: [],
      settings: {
        url: data.incoming_webhook.url,
        channel: data.incoming_webhook.channel,
        channelId: data.incoming_webhook.channel_id
      }
    });
    ctx.redirect("/settings/integrations/slack");
  });
}

var _default = router;
exports.default = _default;