"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _userDestroyer = _interopRequireDefault(require("../commands/userDestroyer"));

var _userInviter = _interopRequireDefault(require("../commands/userInviter"));

var _userSuspender = _interopRequireDefault(require("../commands/userSuspender"));

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _policies = _interopRequireDefault(require("../policies"));

var _presenters = require("../presenters");

var _sequelize = require("../sequelize");

var _pagination = _interopRequireDefault(require("./middlewares/pagination"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  can,
  authorize
} = _policies.default;
const router = new _koaRouter.default();
router.post("users.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    sort = "createdAt",
    query,
    direction,
    filter
  } = ctx.body;
  if (direction !== "ASC") direction = "DESC";
  ctx.assertSort(sort, _models.User);

  if (filter) {
    ctx.assertIn(filter, ["invited", "viewers", "admins", "active", "all", "suspended"]);
  }

  const actor = ctx.state.user;
  let where = {
    teamId: actor.teamId
  };

  switch (filter) {
    case "invited":
      {
        where = { ...where,
          lastActiveAt: null
        };
        break;
      }

    case "viewers":
      {
        where = { ...where,
          isViewer: true
        };
        break;
      }

    case "admins":
      {
        where = { ...where,
          isAdmin: true
        };
        break;
      }

    case "suspended":
      {
        where = { ...where,
          suspendedAt: {
            [_sequelize.Op.ne]: null
          }
        };
        break;
      }

    case "all":
      {
        break;
      }

    default:
      {
        where = { ...where,
          suspendedAt: {
            [_sequelize.Op.eq]: null
          }
        };
        break;
      }
  }

  if (query) {
    where = { ...where,
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }

  const [users, total] = await Promise.all([_models.User.findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.User.count({
    where
  })]);
  ctx.body = {
    pagination: { ...ctx.state.pagination,
      total
    },
    data: users.map(user => (0, _presenters.presentUser)(user, {
      includeDetails: can(actor, "readDetails", user)
    })),
    policies: (0, _presenters.presentPolicies)(actor, users)
  };
});
router.post("users.count", (0, _authentication.default)(), async ctx => {
  const {
    user
  } = ctx.state;
  const counts = await _models.User.getCounts(user.teamId);
  ctx.body = {
    data: {
      counts
    }
  };
});
router.post("users.info", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  const actor = ctx.state.user;
  const user = id ? await _models.User.findByPk(id) : actor;
  authorize(actor, "read", user);
  const includeDetails = can(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
});
router.post("users.update", (0, _authentication.default)(), async ctx => {
  const {
    user
  } = ctx.state;
  const {
    name,
    avatarUrl,
    language
  } = ctx.body;
  if (name) user.name = name;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  if (language) user.language = language;
  await user.save();
  await _models.Event.create({
    name: "users.update",
    actorId: user.id,
    userId: user.id,
    teamId: user.teamId,
    ip: ctx.request.ip
  });
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails: true
    })
  };
}); // Admin specific

router.post("users.promote", (0, _authentication.default)(), async ctx => {
  const userId = ctx.body.id;
  const teamId = ctx.state.user.teamId;
  const actor = ctx.state.user;
  ctx.assertPresent(userId, "id is required");
  const user = await _models.User.findByPk(userId);
  authorize(actor, "promote", user);
  await user.promote();
  await _models.Event.create({
    name: "users.promote",
    actorId: actor.id,
    userId,
    teamId,
    data: {
      name: user.name
    },
    ip: ctx.request.ip
  });
  const includeDetails = can(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
});
router.post("users.demote", (0, _authentication.default)(), async ctx => {
  const userId = ctx.body.id;
  const teamId = ctx.state.user.teamId;
  let {
    to
  } = ctx.body;
  const actor = ctx.state.user;
  ctx.assertPresent(userId, "id is required");
  to = to === "Viewer" ? "Viewer" : "Member";
  const user = await _models.User.findByPk(userId);
  authorize(actor, "demote", user);
  await user.demote(teamId, to);
  await _models.Event.create({
    name: "users.demote",
    actorId: actor.id,
    userId,
    teamId,
    data: {
      name: user.name
    },
    ip: ctx.request.ip
  });
  const includeDetails = can(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
});
router.post("users.suspend", (0, _authentication.default)(), async ctx => {
  const userId = ctx.body.id;
  const actor = ctx.state.user;
  ctx.assertPresent(userId, "id is required");
  const user = await _models.User.findByPk(userId);
  authorize(actor, "suspend", user);
  await (0, _userSuspender.default)({
    user,
    actorId: actor.id,
    ip: ctx.request.ip
  });
  const includeDetails = can(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
});
router.post("users.activate", (0, _authentication.default)(), async ctx => {
  const userId = ctx.body.id;
  const teamId = ctx.state.user.teamId;
  const actor = ctx.state.user;
  ctx.assertPresent(userId, "id is required");
  const user = await _models.User.findByPk(userId);
  authorize(actor, "activate", user);
  await user.activate();
  await _models.Event.create({
    name: "users.activate",
    actorId: actor.id,
    userId,
    teamId,
    data: {
      name: user.name
    },
    ip: ctx.request.ip
  });
  const includeDetails = can(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
});
router.post("users.invite", (0, _authentication.default)(), async ctx => {
  const {
    invites
  } = ctx.body;
  ctx.assertArray(invites, "invites must be an array");
  const {
    user
  } = ctx.state;
  const team = await _models.Team.findByPk(user.teamId);
  authorize(user, "invite", team);
  const response = await (0, _userInviter.default)({
    user,
    invites,
    ip: ctx.request.ip
  });
  ctx.body = {
    data: {
      sent: response.sent,
      users: response.users.map(user => (0, _presenters.presentUser)(user))
    }
  };
});
router.post("users.delete", (0, _authentication.default)(), async ctx => {
  const {
    confirmation,
    id
  } = ctx.body;
  ctx.assertPresent(confirmation, "confirmation is required");
  const actor = ctx.state.user;
  let user = actor;

  if (id) {
    user = await _models.User.findByPk(id);
  }

  authorize(actor, "delete", user);
  await (0, _userDestroyer.default)({
    user,
    actor,
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
var _default = router;
exports.default = _default;