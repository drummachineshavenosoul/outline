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
router.post("team.update", (0, _authentication.default)(), async ctx => {
  const {
    name,
    avatarUrl,
    subdomain,
    sharing,
    guestSignin,
    documentEmbeds
  } = ctx.body;
  const user = ctx.state.user;
  const team = await _models.Team.findByPk(user.teamId);
  authorize(user, "update", team);

  if (subdomain !== undefined && process.env.SUBDOMAINS_ENABLED === "true") {
    team.subdomain = subdomain === "" ? null : subdomain;
  }

  if (name) team.name = name;
  if (sharing !== undefined) team.sharing = sharing;
  if (documentEmbeds !== undefined) team.documentEmbeds = documentEmbeds;
  if (guestSignin !== undefined) team.guestSignin = guestSignin;
  if (avatarUrl !== undefined) team.avatarUrl = avatarUrl;
  const changes = team.changed();
  const data = {};
  await team.save();

  if (changes) {
    for (const change of changes) {
      data[change] = team[change];
    }

    await _models.Event.create({
      name: "teams.update",
      actorId: user.id,
      teamId: user.teamId,
      data,
      ip: ctx.request.ip
    });
  }

  ctx.body = {
    data: (0, _presenters.presentTeam)(team),
    policies: (0, _presenters.presentPolicies)(user, [team])
  };
});
var _default = router;
exports.default = _default;