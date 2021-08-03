"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _fractionalIndex = _interopRequireDefault(require("fractional-index"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _errors = require("../errors");

var _exporter = require("../exporter");

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _policies = _interopRequireDefault(require("../policies"));

var _presenters = require("../presenters");

var _sequelize = require("../sequelize");

var _collectionIndexing = _interopRequireDefault(require("../utils/collectionIndexing"));

var _removeIndexCollision = _interopRequireDefault(require("../utils/removeIndexCollision"));

var _zip = require("../utils/zip");

var _pagination = _interopRequireDefault(require("./middlewares/pagination"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  authorize
} = _policies.default;
const router = new _koaRouter.default();
router.post("collections.create", (0, _authentication.default)(), async ctx => {
  const {
    name,
    color,
    description,
    permission,
    sharing,
    icon,
    sort = _models.Collection.DEFAULT_SORT
  } = ctx.body;
  let {
    index
  } = ctx.body;
  ctx.assertPresent(name, "name is required");

  if (color) {
    ctx.assertHexColor(color, "Invalid hex value (please use format #FFFFFF)");
  }

  const user = ctx.state.user;
  authorize(user, "createCollection", user.team);
  const collections = await _models.Collection.findAll({
    where: {
      teamId: user.teamId,
      deletedAt: null
    },
    attributes: ["id", "index", "updatedAt"],
    limit: 1,
    order: [// using LC_COLLATE:"C" because we need byte order to drive the sorting
    _sequelize.sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]]
  });

  if (index) {
    ctx.assertIndexCharacters(index, "Index characters must be between x20 to x7E ASCII");
  } else {
    index = (0, _fractionalIndex.default)(null, collections.length ? collections[0].index : null);
  }

  index = await (0, _removeIndexCollision.default)(user.teamId, index);
  let collection = await _models.Collection.create({
    name,
    description,
    icon,
    color,
    teamId: user.teamId,
    createdById: user.id,
    permission: permission ? permission : null,
    sharing,
    sort,
    index
  });
  await _models.Event.create({
    name: "collections.create",
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: user.id,
    data: {
      name
    },
    ip: ctx.request.ip
  }); // we must reload the collection to get memberships for policy presenter

  collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(collection.id);
  ctx.body = {
    data: (0, _presenters.presentCollection)(collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.info", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  authorize(user, "read", collection);
  ctx.body = {
    data: (0, _presenters.presentCollection)(collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.import", (0, _authentication.default)(), async ctx => {
  const {
    type,
    attachmentId
  } = ctx.body;
  ctx.assertIn(type, ["outline"], "type must be one of 'outline'");
  ctx.assertUuid(attachmentId, "attachmentId is required");
  const user = ctx.state.user;
  authorize(user, "importCollection", user.team);
  const attachment = await _models.Attachment.findByPk(attachmentId);
  authorize(user, "read", attachment);
  await _models.Event.create({
    name: "collections.import",
    modelId: attachmentId,
    teamId: user.teamId,
    actorId: user.id,
    data: {
      type
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("collections.add_group", (0, _authentication.default)(), async ctx => {
  const {
    id,
    groupId,
    permission = "read_write"
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  ctx.assertUuid(groupId, "groupId is required");
  const collection = await _models.Collection.scope({
    method: ["withMembership", ctx.state.user.id]
  }).findByPk(id);
  authorize(ctx.state.user, "update", collection);
  const group = await _models.Group.findByPk(groupId);
  authorize(ctx.state.user, "read", group);
  let membership = await _models.CollectionGroup.findOne({
    where: {
      collectionId: id,
      groupId
    }
  });

  if (!membership) {
    membership = await _models.CollectionGroup.create({
      collectionId: id,
      groupId,
      permission,
      createdById: ctx.state.user.id
    });
  } else if (permission) {
    membership.permission = permission;
    await membership.save();
  }

  await _models.Event.create({
    name: "collections.add_group",
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: ctx.state.user.id,
    data: {
      name: group.name,
      groupId
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: {
      collectionGroupMemberships: [(0, _presenters.presentCollectionGroupMembership)(membership)]
    }
  };
});
router.post("collections.remove_group", (0, _authentication.default)(), async ctx => {
  const {
    id,
    groupId
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  ctx.assertUuid(groupId, "groupId is required");
  const collection = await _models.Collection.scope({
    method: ["withMembership", ctx.state.user.id]
  }).findByPk(id);
  authorize(ctx.state.user, "update", collection);
  const group = await _models.Group.findByPk(groupId);
  authorize(ctx.state.user, "read", group);
  await collection.removeGroup(group);
  await _models.Event.create({
    name: "collections.remove_group",
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: ctx.state.user.id,
    data: {
      name: group.name,
      groupId
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("collections.group_memberships", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  authorize(user, "read", collection);
  let where = {
    collectionId: id
  };
  let groupWhere;

  if (query) {
    groupWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }

  if (permission) {
    where = { ...where,
      permission
    };
  }

  const memberships = await _models.CollectionGroup.findAll({
    where,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit,
    include: [{
      model: _models.Group,
      as: "group",
      where: groupWhere,
      required: true
    }]
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      collectionGroupMemberships: memberships.map(_presenters.presentCollectionGroupMembership),
      groups: memberships.map(membership => (0, _presenters.presentGroup)(membership.group))
    }
  };
});
router.post("collections.add_user", (0, _authentication.default)(), async ctx => {
  const {
    id,
    userId,
    permission = "read_write"
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  ctx.assertUuid(userId, "userId is required");
  const collection = await _models.Collection.scope({
    method: ["withMembership", ctx.state.user.id]
  }).findByPk(id);
  authorize(ctx.state.user, "update", collection);
  const user = await _models.User.findByPk(userId);
  authorize(ctx.state.user, "read", user);
  let membership = await _models.CollectionUser.findOne({
    where: {
      collectionId: id,
      userId
    }
  });

  if (!membership) {
    membership = await _models.CollectionUser.create({
      collectionId: id,
      userId,
      permission,
      createdById: ctx.state.user.id
    });
  } else if (permission) {
    membership.permission = permission;
    await membership.save();
  }

  await _models.Event.create({
    name: "collections.add_user",
    userId,
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: ctx.state.user.id,
    data: {
      name: user.name
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      memberships: [(0, _presenters.presentMembership)(membership)]
    }
  };
});
router.post("collections.remove_user", (0, _authentication.default)(), async ctx => {
  const {
    id,
    userId
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  ctx.assertUuid(userId, "userId is required");
  const collection = await _models.Collection.scope({
    method: ["withMembership", ctx.state.user.id]
  }).findByPk(id);
  authorize(ctx.state.user, "update", collection);
  const user = await _models.User.findByPk(userId);
  authorize(ctx.state.user, "read", user);
  await collection.removeUser(user);
  await _models.Event.create({
    name: "collections.remove_user",
    userId,
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: ctx.state.user.id,
    data: {
      name: user.name
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
}); // DEPRECATED: Use collection.memberships which has pagination, filtering and permissions

router.post("collections.users", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  authorize(user, "read", collection);
  const users = await collection.getUsers();
  ctx.body = {
    data: users.map(_presenters.presentUser)
  };
});
router.post("collections.memberships", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  authorize(user, "read", collection);
  let where = {
    collectionId: id
  };
  let userWhere;

  if (query) {
    userWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }

  if (permission) {
    where = { ...where,
      permission
    };
  }

  const memberships = await _models.CollectionUser.findAll({
    where,
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
      memberships: memberships.map(_presenters.presentMembership),
      users: memberships.map(membership => (0, _presenters.presentUser)(membership.user))
    }
  };
});
router.post("collections.export", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertUuid(id, "id is required");
  const user = ctx.state.user;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  authorize(user, "export", collection);
  const filePath = await (0, _zip.archiveCollection)(collection);
  await _models.Event.create({
    name: "collections.export",
    collectionId: collection.id,
    teamId: user.teamId,
    actorId: user.id,
    data: {
      title: collection.title
    },
    ip: ctx.request.ip
  });
  ctx.attachment(`${collection.name}.zip`);
  ctx.set("Content-Type", "application/force-download");
  ctx.body = _fs.default.createReadStream(filePath);
});
router.post("collections.export_all", (0, _authentication.default)(), async ctx => {
  const {
    download = false
  } = ctx.body;
  const user = ctx.state.user;
  const team = await _models.Team.findByPk(user.teamId);
  authorize(user, "export", team);
  await _models.Event.create({
    name: "collections.export",
    teamId: user.teamId,
    actorId: user.id,
    ip: ctx.request.ip
  });

  if (download) {
    const collections = await _models.Collection.findAll({
      where: {
        teamId: team.id
      },
      order: [["name", "ASC"]]
    });
    const filePath = await (0, _zip.archiveCollections)(collections);
    ctx.attachment(`${team.name}.zip`);
    ctx.set("Content-Type", "application/force-download");
    ctx.body = _fs.default.createReadStream(filePath);
  } else {
    // async operation to create zip archive and email user
    (0, _exporter.exportCollections)(user.teamId, user.email);
    ctx.body = {
      success: true
    };
  }
});
router.post("collections.update", (0, _authentication.default)(), async ctx => {
  let {
    id,
    name,
    description,
    icon,
    permission,
    color,
    sort,
    sharing
  } = ctx.body;

  if (color) {
    ctx.assertHexColor(color, "Invalid hex value (please use format #FFFFFF)");
  }

  const user = ctx.state.user;
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  authorize(user, "update", collection); // we're making this collection have no default access, ensure that the current
  // user has a read-write membership so that at least they can edit it

  if (permission !== "read_write" && collection.permission === "read_write") {
    await _models.CollectionUser.findOrCreate({
      where: {
        collectionId: collection.id,
        userId: user.id
      },
      defaults: {
        permission: "read_write",
        createdById: user.id
      }
    });
  }

  const permissionChanged = permission !== collection.permission;

  if (name !== undefined) {
    collection.name = name;
  }

  if (description !== undefined) {
    collection.description = description;
  }

  if (icon !== undefined) {
    collection.icon = icon;
  }

  if (color !== undefined) {
    collection.color = color;
  }

  if (permission !== undefined) {
    collection.permission = permission ? permission : null;
  }

  if (sharing !== undefined) {
    collection.sharing = sharing;
  }

  if (sort !== undefined) {
    collection.sort = sort;
  }

  await collection.save();
  await _models.Event.create({
    name: "collections.update",
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: user.id,
    data: {
      name
    },
    ip: ctx.request.ip
  }); // must reload to update collection membership for correct policy calculation
  // if the privacy level has changed. Otherwise skip this query for speed.

  if (permissionChanged) {
    await collection.reload();
  }

  ctx.body = {
    data: (0, _presenters.presentCollection)(collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.list", (0, _authentication.default)(), (0, _pagination.default)(), async ctx => {
  const user = ctx.state.user;
  const collectionIds = await user.collectionIds();
  let collections = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findAll({
    where: {
      teamId: user.teamId,
      id: collectionIds
    },
    order: [["updatedAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const nullIndexCollection = collections.findIndex(collection => collection.index === null);

  if (nullIndexCollection !== -1) {
    const indexedCollections = await (0, _collectionIndexing.default)(ctx.state.user.teamId);
    collections.forEach(collection => {
      collection.index = indexedCollections[collection.id];
    });
  }

  ctx.body = {
    pagination: ctx.state.pagination,
    data: collections.map(_presenters.presentCollection),
    policies: (0, _presenters.presentPolicies)(user, collections)
  };
});
router.post("collections.delete", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  const user = ctx.state.user;
  ctx.assertUuid(id, "id is required");
  const collection = await _models.Collection.scope({
    method: ["withMembership", user.id]
  }).findByPk(id);
  authorize(user, "delete", collection);
  const total = await _models.Collection.count();
  if (total === 1) throw new _errors.ValidationError("Cannot delete last collection");
  await collection.destroy();
  await _models.Event.create({
    name: "collections.delete",
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: user.id,
    data: {
      name: collection.name
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("collections.move", (0, _authentication.default)(), async ctx => {
  const id = ctx.body.id;
  let index = ctx.body.index;
  ctx.assertPresent(index, "index is required");
  ctx.assertIndexCharacters(index, "Index characters must be between x20 to x7E ASCII");
  ctx.assertUuid(id, "id must be a uuid");
  const user = ctx.state.user;
  const collection = await _models.Collection.findByPk(id);
  authorize(user, "move", collection);
  index = await (0, _removeIndexCollision.default)(user.teamId, index);
  await collection.update({
    index
  });
  await _models.Event.create({
    name: "collections.move",
    collectionId: collection.id,
    teamId: collection.teamId,
    actorId: user.id,
    data: {
      index
    },
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true,
    data: {
      index
    }
  };
});
var _default = router;
exports.default = _default;