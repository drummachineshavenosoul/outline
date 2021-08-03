"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NotificationSetting = _sequelize.sequelize.define("notification_setting", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  event: {
    type: _sequelize.DataTypes.STRING,
    validate: {
      isIn: [["documents.publish", "documents.update", "collections.create", "emails.onboarding", "emails.features"]]
    }
  }
}, {
  timestamps: true,
  updatedAt: false,
  getterMethods: {
    unsubscribeUrl: function () {
      const token = NotificationSetting.getUnsubscribeToken(this.userId);
      return `${process.env.URL}/api/notificationSettings.unsubscribe?token=${token}&id=${this.id}`;
    },
    unsubscribeToken: function () {
      return NotificationSetting.getUnsubscribeToken(this.userId);
    }
  }
});

NotificationSetting.getUnsubscribeToken = userId => {
  const hash = _crypto.default.createHash("sha256");

  hash.update(`${userId}-${process.env.SECRET_KEY}`);
  return hash.digest("hex");
};

NotificationSetting.associate = models => {
  NotificationSetting.belongsTo(models.User, {
    as: "user",
    foreignKey: "userId",
    onDelete: "cascade"
  });
  NotificationSetting.belongsTo(models.Team, {
    as: "team",
    foreignKey: "teamId"
  });
};

var _default = NotificationSetting;
exports.default = _default;