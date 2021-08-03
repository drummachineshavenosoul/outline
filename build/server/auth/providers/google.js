"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.config = void 0;

var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _lodash = require("lodash");

var _passportGoogleOauth = require("passport-google-oauth2");

var _accountProvisioner = _interopRequireDefault(require("../../commands/accountProvisioner"));

var _env = _interopRequireDefault(require("../../env"));

var _errors = require("../../errors");

var _passport = _interopRequireDefault(require("../../middlewares/passport"));

var _authentication = require("../../utils/authentication");

var _passport2 = require("../../utils/passport");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = new _koaRouter.default();
const providerName = "google";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const allowedDomains = (0, _authentication.getAllowedDomains)();
const scopes = ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"];
const config = {
  name: "Google",
  enabled: !!GOOGLE_CLIENT_ID
};
exports.config = config;

if (GOOGLE_CLIENT_ID) {
  _koaPassport.default.use(new _passportGoogleOauth.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${_env.default.URL}/auth/google.callback`,
    passReqToCallback: true,
    store: new _passport2.StateStore(),
    scope: scopes
  }, async function (req, accessToken, refreshToken, profile, done) {
    try {
      const domain = profile._json.hd;

      if (!domain) {
        throw new _errors.GoogleWorkspaceRequiredError();
      }

      if (allowedDomains.length && !allowedDomains.includes(domain)) {
        throw new _errors.GoogleWorkspaceInvalidError();
      }

      const subdomain = domain.split(".")[0];
      const teamName = (0, _lodash.capitalize)(subdomain);
      const result = await (0, _accountProvisioner.default)({
        ip: req.ip,
        team: {
          name: teamName,
          domain,
          subdomain
        },
        user: {
          name: profile.displayName,
          email: profile.email,
          avatarUrl: profile.picture
        },
        authenticationProvider: {
          name: providerName,
          providerId: domain
        },
        authentication: {
          providerId: profile.id,
          accessToken,
          refreshToken,
          scopes
        }
      });
      return done(null, result.user, result);
    } catch (err) {
      return done(err, null);
    }
  }));

  router.get("google", _koaPassport.default.authenticate(providerName, {
    accessType: "offline",
    prompt: "select_account consent"
  }));
  router.get("google.callback", (0, _passport.default)(providerName));
}

var _default = router;
exports.default = _default;