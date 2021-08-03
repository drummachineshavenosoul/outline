"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dateFns = require("date-fns");

var _constants = require("../../shared/constants");

var _models = require("../models");

var _sequelize = require("../sequelize");

const View = _sequelize.sequelize.define("view", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  lastEditingAt: {
    type: _sequelize.DataTypes.DATE
  },
  count: {
    type: _sequelize.DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  classMethods: {}
});

View.associate = models => {
  View.belongsTo(models.Document);
  View.belongsTo(models.User);
};

View.increment = async where => {
  const [model, created] = await View.findOrCreate({
    where
  });

  if (!created) {
    model.count += 1;
    model.save();
  }

  return model;
};

View.findByDocument = async documentId => {
  return View.findAll({
    where: {
      documentId
    },
    order: [["updatedAt", "DESC"]],
    include: [{
      model: _models.User,
      paranoid: false
    }]
  });
};

View.findRecentlyEditingByDocument = async documentId => {
  return View.findAll({
    where: {
      documentId,
      lastEditingAt: {
        [_sequelize.Op.gt]: (0, _dateFns.subMilliseconds)(new Date(), _constants.USER_PRESENCE_INTERVAL * 2)
      }
    },
    order: [["lastEditingAt", "DESC"]]
  });
};

View.touch = async (documentId, userId, isEditing) => {
  const [view] = await View.findOrCreate({
    where: {
      userId,
      documentId
    }
  });

  if (isEditing) {
    const lastEditingAt = new Date();
    view.lastEditingAt = lastEditingAt;
    await view.save();
  }

  return view;
};

var _default = View;
exports.default = _default;