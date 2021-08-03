"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sequelize = require("../sequelize");

const SearchQuery = _sequelize.sequelize.define("search_queries", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  source: {
    type: _sequelize.DataTypes.ENUM("slack", "app", "api"),
    allowNull: false
  },
  query: {
    type: _sequelize.DataTypes.STRING,

    set(val) {
      this.setDataValue("query", val.substring(0, 255));
    },

    allowNull: false
  },
  results: {
    type: _sequelize.DataTypes.NUMBER,
    allowNull: false
  }
}, {
  timestamps: true,
  updatedAt: false
});

SearchQuery.associate = models => {
  SearchQuery.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId"
  });
  SearchQuery.belongsTo(models.Team, {
    as: "team",
    foreignKey: "teamId"
  });
};

var _default = SearchQuery;
exports.default = _default;