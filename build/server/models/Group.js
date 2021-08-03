"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _models = require("../models");

var _sequelize = require("../sequelize");

const Group = _sequelize.sequelize.define("group", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  teamId: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4
  },
  name: {
    type: _sequelize.DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true,
  validate: {
    isUniqueNameInTeam: async function () {
      const foundItem = await Group.findOne({
        where: {
          teamId: this.teamId,
          name: {
            [_sequelize.Op.iLike]: this.name
          },
          id: {
            [_sequelize.Op.not]: this.id
          }
        }
      });

      if (foundItem) {
        throw new Error("The name of this group is already in use");
      }
    }
  }
});

Group.associate = models => {
  Group.hasMany(models.GroupUser, {
    as: "groupMemberships",
    foreignKey: "groupId"
  });
  Group.hasMany(models.CollectionGroup, {
    as: "collectionGroupMemberships",
    foreignKey: "groupId"
  });
  Group.belongsTo(models.Team, {
    as: "team",
    foreignKey: "teamId"
  });
  Group.belongsTo(models.User, {
    as: "createdBy",
    foreignKey: "createdById"
  });
  Group.belongsToMany(models.User, {
    as: "users",
    through: models.GroupUser,
    foreignKey: "groupId"
  });
  Group.addScope("defaultScope", {
    include: [{
      association: "groupMemberships",
      required: false
    }],
    order: [["name", "ASC"]]
  });
}; // Cascade deletes to group and collection relations


Group.addHook("afterDestroy", async (group, options) => {
  if (!group.deletedAt) return;
  await _models.GroupUser.destroy({
    where: {
      groupId: group.id
    }
  });
  await _models.CollectionGroup.destroy({
    where: {
      groupId: group.id
    }
  });
});
var _default = Group;
exports.default = _default;