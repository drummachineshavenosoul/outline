"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _constants = require("../../shared/constants");

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _policies = _interopRequireDefault(require("../policies"));

var _presenters = require("../presenters");

var _sequelize = require("../sequelize");

var _pagination = _interopRequireDefault(require("./middlewares/pagination"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  authorize
} = _policies.default;
const router = new _koaRouter.default();
router.post("groups.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  let {
    sort = "updatedAt",
    direction
  } = ctx.body;
  if (direction !== "ASC") direction = "DESC";
  ctx.assertSort(sort, _models.Group);
  const user = ctx.state.user;
  let groups = await _models.Group.findAll({
    where: {
      teamId: user.teamId
    },
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });

  if (!user.isAdmin) {
    groups = groups.filter(group => group.groupMemberships.filter(gm => gm.userId === user.id).length);
  }

  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      groups: groups.map(_presenters.presentGroup),
      groupMemberships: groups.map(g => g.groupMemberships.filter(membership => !!membership.user).slice(0, _constants.MAX_AVATAR_DISPLAY)).flat().map(_presenters.presentGroupMembership)
    },
    policies: (0, _presenters.presentPolicies)(user, groups)
  };
});
router.post("groups.info", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const group = await _models.Group.findByPk(id);
  authorize(user, "read", group);
  ctx.body = {
    data: (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.create", (0, _authentication.default)(), async ctx => {
  const {
    name
  } = ctx.body;
  ctx.assertPresent(name, "name is required");
  const user = ctx.state.user;
  authorize(user, "createGroup", user.team);
  let group = await _models.Group.create({
    name,
    teamId: user.teamId,
    createdById: user.id
  }); // reload to get default scope

  group = await _models.Group.findByPk(group.id);
  await _models.Event.create({
    name: "groups.create",
    actorId: user.id,
    teamId: user.teamId,
    modelId: group.id,
    data: {
      name: group.name
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.update", (0, _authentication.default)(), async ctx => {
  const {
    id,
    name
  } = ctx.body;
  ctx.assertPresent(name, "name is required");
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const group = await _models.Group.findByPk(id);
  authorize(user, "update", group);
  group.name = name;

  if (group.changed()) {
    await group.save();
    await _models.Event.create({
      name: "groups.update",
      teamId: user.teamId,
      actorId: user.id,
      modelId: group.id,
      data: {
        name
      },
      ip: ctx.request.ip
    });
  }

  ctx.body = {
    data: (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.delete", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const {
    user
  } = ctx.state;
  const group = await _models.Group.findByPk(id);
  authorize(user, "delete", group);
  await group.destroy();
  await _models.Event.create({
    name: "groups.delete",
    actorId: user.id,
    modelId: group.id,
    teamId: group.teamId,
    data: {
      name: group.name
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("groups.memberships", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const {
    id,
    query
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const group = await _models.Group.findByPk(id);
  authorize(user, "read", group);
  let userWhere;

  if (query) {
    userWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }

  const memberships = await _models.GroupUser.findAll({
    where: {
      groupId: id
    },
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit,
    include: [{
      model: _models.User,
      as: "user",
      where: userWhere,
      required: true
    }]
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      groupMemberships: memberships.map(_presenters.presentGroupMembership),
      users: memberships.map(membership => (0, _presenters.presentUser)(membership.user))
    }
  };
});
router.post("groups.add_user", (0, _authentication.default)(), async ctx => {
  const {
    id,
    userId
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  ctx.assertUuid(userId, "userId is required");
  const user = await _models.User.findByPk(userId);
  authorize(ctx.state.user, "read", user);
  let group = await _models.Group.findByPk(id);
  authorize(ctx.state.user, "update", group);
  let membership = await _models.GroupUser.findOne({
    where: {
      groupId: id,
      userId
    }
  });

  if (!membership) {
    await group.addUser(user, {
      through: {
        createdById: ctx.state.user.id
      }
    }); // reload to get default scope

    membership = await _models.GroupUser.findOne({
      where: {
        groupId: id,
        userId
      }
    }); // reload to get default scope

    group = await _models.Group.findByPk(id);
    await _models.Event.create({
      name: "groups.add_user",
      userId,
      teamId: user.teamId,
      modelId: group.id,
      actorId: ctx.state.user.id,
      data: {
        name: user.name
      },
      ip: ctx.request.ip
    });
  }

  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      groupMemberships: [(0, _presenters.presentGroupMembership)(membership)],
      groups: [(0, _presenters.presentGroup)(group)]
    }
  };
});
router.post("groups.remove_user", (0, _authentication.default)(), async ctx => {
  const {
    id,
    userId
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  ctx.assertUuid(userId, "userId is required");
  let group = await _models.Group.findByPk(id);
  authorize(ctx.state.user, "update", group);
  const user = await _models.User.findByPk(userId);
  authorize(ctx.state.user, "read", user);
  await group.removeUser(user);
  await _models.Event.create({
    name: "groups.remove_user",
    userId,
    modelId: group.id,
    teamId: user.teamId,
    actorId: ctx.state.user.id,
    data: {
      name: user.name
    },
    ip: ctx.request.ip
  }); // reload to get default scope

  group = await _models.Group.findByPk(id);
  ctx.body = {
    data: {
      groups: [(0, _presenters.presentGroup)(group)]
    }
  };
});
var _default = router;
exports.default = _default;