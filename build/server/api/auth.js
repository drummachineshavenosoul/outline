"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _lodash = require("lodash");

var _domains = require("../../shared/utils/domains");

var _providers = _interopRequireDefault(require("../auth/providers"));

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _presenters = require("../presenters");

var _domains2 = require("../utils/domains");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = new _koaRouter.default();

function filterProviders(team) {
  return _providers.default.sort(provider => provider.id === "email" ? 1 : -1).filter(provider => {
    // guest sign-in is an exception as it does not have an authentication
    // provider using passport, instead it exists as a boolean option on the team
    if (provider.id === "email") {
      return team && team.guestSignin;
    }

    return !team || (0, _lodash.find)(team.authenticationProviders, {
      name: provider.id,
      enabled: true
    });
  }).map(provider => ({
    id: provider.id,
    name: provider.name,
    authUrl: provider.authUrl
  }));
}

router.post("auth.config", async ctx => {
  // If self hosted AND there is only one team then that team becomes the
  // brand for the knowledge base and it's guest signin option is used for the
  // root login page.
  if (process.env.DEPLOYMENT !== "hosted") {
    const teams = await _models.Team.scope("withAuthenticationProviders").findAll();

    if (teams.length === 1) {
      const team = teams[0];
      ctx.body = {
        data: {
          name: team.name,
          providers: filterProviders(team)
        }
      };
      return;
    }
  }

  if ((0, _domains2.isCustomDomain)(ctx.request.hostname)) {
    const team = await _models.Team.scope("withAuthenticationProviders").findOne({
      where: {
        domain: ctx.request.hostname
      }
    });

    if (team) {
      ctx.body = {
        data: {
          name: team.name,
          hostname: ctx.request.hostname,
          providers: filterProviders(team)
        }
      };
      return;
    }
  } // If subdomain signin page then we return minimal team details to allow
  // for a custom screen showing only relevant signin options for that team.


  if (process.env.SUBDOMAINS_ENABLED === "true" && (0, _domains.isCustomSubdomain)(ctx.request.hostname) && !(0, _domains2.isCustomDomain)(ctx.request.hostname)) {
    const domain = (0, _domains.parseDomain)(ctx.request.hostname);
    const subdomain = domain ? domain.subdomain : undefined;
    const team = await _models.Team.scope("withAuthenticationProviders").findOne({
      where: {
        subdomain
      }
    });

    if (team) {
      ctx.body = {
        data: {
          name: team.name,
          hostname: ctx.request.hostname,
          providers: filterProviders(team)
        }
      };
      return;
    }
  } // Otherwise, we're requesting from the standard root signin page


  ctx.body = {
    data: {
      providers: filterProviders()
    }
  };
});
router.post("auth.info", (0, _authentication.default)(), async ctx => {
  const user = ctx.state.user;
  const team = await _models.Team.findByPk(user.teamId);
  ctx.body = {
    data: {
      user: (0, _presenters.presentUser)(user, {
        includeDetails: true
      }),
      team: (0, _presenters.presentTeam)(team)
    },
    policies: (0, _presenters.presentPolicies)(user, [team])
  };
});
var _default = router;
exports.default = _default;