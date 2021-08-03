"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debug = _interopRequireDefault(require("debug"));

var _mailer = _interopRequireDefault(require("../mailer"));

var _models = require("../models");

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug.default)("services");

class Notifications {
  async on(event) {
    switch (event.name) {
      case "documents.publish":
      case "documents.update.debounced":
        return this.documentUpdated(event);

      case "collections.create":
        return this.collectionCreated(event);

      default:
    }
  }

  async documentUpdated(event) {
    // never send notifications when batch importing documents
    if (event.data && event.data.source === "import") return;
    const document = await _models.Document.findByPk(event.documentId);
    if (!document) return;
    const {
      collection
    } = document;
    if (!collection) return;
    const team = await _models.Team.findByPk(document.teamId);
    if (!team) return;
    const notificationSettings = await _models.NotificationSetting.findAll({
      where: {
        userId: {
          [_sequelize.Op.ne]: document.lastModifiedById
        },
        teamId: document.teamId,
        event: event.name === "documents.publish" ? "documents.publish" : "documents.update"
      },
      include: [{
        model: _models.User,
        required: true,
        as: "user"
      }]
    });
    const eventName = event.name === "documents.publish" ? "published" : "updated";

    for (const setting of notificationSettings) {
      // For document updates we only want to send notifications if
      // the document has been edited by the user with this notification setting
      // This could be replaced with ability to "follow" in the future
      if (eventName === "updated" && !document.collaboratorIds.includes(setting.userId)) {
        return;
      } // Check the user has access to the collection this document is in. Just
      // because they were a collaborator once doesn't mean they still are.


      const collectionIds = await setting.user.collectionIds();

      if (!collectionIds.includes(document.collectionId)) {
        return;
      } // If this user has viewed the document since the last update was made
      // then we can avoid sending them a useless notification, yay.


      const view = await _models.View.findOne({
        where: {
          userId: setting.userId,
          documentId: event.documentId,
          updatedAt: {
            [_sequelize.Op.gt]: document.updatedAt
          }
        }
      });

      if (view) {
        log(`suppressing notification to ${setting.userId} because update viewed`);
        return;
      }

      _mailer.default.documentNotification({
        to: setting.user.email,
        eventName,
        document,
        team,
        collection,
        actor: document.updatedBy,
        unsubscribeUrl: setting.unsubscribeUrl
      });
    }
  }

  async collectionCreated(event) {
    const collection = await _models.Collection.findByPk(event.collectionId, {
      include: [{
        model: _models.User,
        required: true,
        as: "user"
      }]
    });
    if (!collection) return;
    if (!collection.permission) return;
    const notificationSettings = await _models.NotificationSetting.findAll({
      where: {
        userId: {
          [_sequelize.Op.ne]: collection.createdById
        },
        teamId: collection.teamId,
        event: event.name
      },
      include: [{
        model: _models.User,
        required: true,
        as: "user"
      }]
    });
    notificationSettings.forEach(setting => _mailer.default.collectionNotification({
      to: setting.user.email,
      eventName: "created",
      collection,
      actor: collection.user,
      unsubscribeUrl: setting.unsubscribeUrl
    }));
  }

}

exports.default = Notifications;