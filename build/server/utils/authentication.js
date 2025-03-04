"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllowedDomains = getAllowedDomains;
exports.signIn = signIn;

var _querystring = _interopRequireDefault(require("querystring"));

var Sentry = _interopRequireWildcard(require("@sentry/node"));

var _dateFns = require("date-fns");

var _lodash = require("lodash");

var _models = require("../models");

var _domains = require("../utils/domains");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAllowedDomains() {
  // GOOGLE_ALLOWED_DOMAINS included here for backwards compatability
  const env = process.env.ALLOWED_DOMAINS || process.env.GOOGLE_ALLOWED_DOMAINS;
  return env ? env.split(",") : [];
}

async function signIn(ctx, user, team, service, isNewUser = false, isNewTeam = false) {
  if (user.isSuspended) {
    return ctx.redirect("/?notice=suspended");
  }

  if (isNewTeam) {
    // see: scenes/Login/index.js for where this cookie is written when
    // viewing the /login or /create pages. It is a URI encoded JSON string.
    const cookie = ctx.cookies.get("signupQueryParams");

    if (cookie) {
      try {
        const signupQueryParams = (0, _lodash.pick)(JSON.parse(_querystring.default.unescape(cookie)), ["ref", "utm_content", "utm_medium", "utm_source", "utm_campaign"]);
        await team.update({
          signupQueryParams
        });
      } catch (err) {
        Sentry.captureException(err);
      }
    }
  } // update the database when the user last signed in


  user.updateSignedIn(ctx.request.ip); // don't await event creation for a faster sign-in

  _models.Event.create({
    name: "users.signin",
    actorId: user.id,
    userId: user.id,
    teamId: team.id,
    data: {
      name: user.name,
      service
    },
    ip: ctx.request.ip
  });

  const domain = (0, _domains.getCookieDomain)(ctx.request.hostname);
  const expires = (0, _dateFns.addMonths)(new Date(), 3); // set a cookie for which service we last signed in with. This is
  // only used to display a UI hint for the user for next time

  ctx.cookies.set("lastSignedIn", service, {
    httpOnly: false,
    expires: new Date("2100"),
    domain
  }); // set a transfer cookie for the access token itself and redirect
  // to the teams subdomain if subdomains are enabled

  if (process.env.SUBDOMAINS_ENABLED === "true" && team.subdomain) {
    // get any existing sessions (teams signed in) and add this team
    const existing = JSON.parse(decodeURIComponent(ctx.cookies.get("sessions") || "") || "{}");
    const sessions = encodeURIComponent(JSON.stringify({ ...existing,
      [team.id]: {
        name: team.name,
        logoUrl: team.logoUrl,
        url: team.url
      }
    }));
    ctx.cookies.set("sessions", sessions, {
      httpOnly: false,
      expires,
      domain
    });
    ctx.redirect(`${team.url}/auth/redirect?token=${user.getTransferToken()}`);
  } else {
    ctx.cookies.set("accessToken", user.getJwtToken(), {
      httpOnly: false,
      expires
    });
    ctx.redirect(`${team.url}/home${isNewUser ? "?welcome" : ""}`);
  }
}