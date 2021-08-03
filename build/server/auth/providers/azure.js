"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = request;
exports.default = exports.config = void 0;

var _koaPassport = _interopRequireDefault(require("@outlinewiki/koa-passport"));

var _passportAzureAdOauth = require("@outlinewiki/passport-azure-ad-oauth2");

var _fetchWithProxy = _interopRequireDefault(require("fetch-with-proxy"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _accountProvisioner = _interopRequireDefault(require("../../commands/accountProvisioner"));

var _env = _interopRequireDefault(require("../../env"));

var _errors = require("../../errors");

var _passport = _interopRequireDefault(require("../../middlewares/passport"));

var _passport2 = require("../../utils/passport");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = new _koaRouter.default();
const providerName = "azure";
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const AZURE_RESOURCE_APP_ID = process.env.AZURE_RESOURCE_APP_ID;
const scopes = [];

async function request(endpoint, accessToken) {
  const response = await (0, _fetchWithProxy.default)(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  return response.json();
}

const config = {
  name: "Microsoft",
  enabled: !!AZURE_CLIENT_ID
};
exports.config = config;

if (AZURE_CLIENT_ID) {
  const strategy = new _passportAzureAdOauth.Strategy({
    clientID: AZURE_CLIENT_ID,
    clientSecret: AZURE_CLIENT_SECRET,
    callbackURL: `${_env.default.URL}/auth/azure.callback`,
    useCommonEndpoint: true,
    passReqToCallback: true,
    resource: AZURE_RESOURCE_APP_ID,
    store: new _passport2.StateStore(),
    scope: scopes
  }, async function (req, accessToken, refreshToken, params, _, done) {
    try {
      // see docs for what the fields in profile represent here:
      // https://docs.microsoft.com/en-us/azure/active-directory/develop/access-tokens
      const profile = _jsonwebtoken.default.decode(params.id_token); // Load the users profile from the Microsoft Graph API
      // https://docs.microsoft.com/en-us/graph/api/resources/users?view=graph-rest-1.0


      const profileResponse = await request(`https://graph.microsoft.com/v1.0/me`, accessToken);

      if (!profileResponse) {
        throw new _errors.MicrosoftGraphError("Unable to load user profile from Microsoft Graph API");
      } // Load the organization profile from the Microsoft Graph API
      // https://docs.microsoft.com/en-us/graph/api/organization-get?view=graph-rest-1.0


      const organizationResponse = await request(`https://graph.microsoft.com/v1.0/organization`, accessToken);

      if (!organizationResponse) {
        throw new _errors.MicrosoftGraphError("Unable to load organization info from Microsoft Graph API");
      }

      const organization = organizationResponse.value[0];
      const email = profile.email || profileResponse.mail;

      if (!email) {
        throw new _errors.MicrosoftGraphError("'email' property is required but could not be found in user profile.");
      }

      const domain = email.split("@")[1];
      const subdomain = domain.split(".")[0];
      const teamName = organization.displayName;
      const result = await (0, _accountProvisioner.default)({
        ip: req.ip,
        team: {
          name: teamName,
          domain,
          subdomain
        },
        user: {
          name: profile.name,
          email,
          avatarUrl: profile.picture
        },
        authenticationProvider: {
          name: providerName,
          providerId: profile.tid
        },
        authentication: {
          providerId: profile.oid,
          accessToken,
          refreshToken,
          scopes
        }
      });
      return done(null, result.user, result);
    } catch (err) {
      return done(err, null);
    }
  });

  _koaPassport.default.use(strategy);

  router.get("azure", _koaPassport.default.authenticate(providerName));
  router.get("azure.callback", (0, _passport.default)(providerName));
}

var _default = router;
exports.default = _default;