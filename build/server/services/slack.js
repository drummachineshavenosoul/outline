"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fetchWithProxy = _interopRequireDefault(require("fetch-with-proxy"));

var _models = require("../models");

var _presenters = require("../presenters");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Slack {
  async on(event) {
    switch (event.name) {
      case "documents.publish":
      case "documents.update.debounced":
        return this.documentUpdated(event);

      case "integrations.create":
        return this.integrationCreated(event);

      default:
    }
  }

  async integrationCreated(event) {
    const integration = await _models.Integration.findOne({
      where: {
        id: event.modelId,
        service: "slack",
        type: "post"
      },
      include: [{
        model: _models.Collection,
        required: true,
        as: "collection"
      }]
    });
    if (!integration) return;
    const collection = integration.collection;
    if (!collection) return;
    await (0, _fetchWithProxy.default)(integration.settings.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: `👋 Hey there! When documents are published or updated in the *${collection.name}* collection on Outline they will be posted to this channel!`,
        attachments: [{
          color: collection.color,
          title: collection.name,
          title_link: `${process.env.URL}${collection.url}`,
          text: collection.description
        }]
      })
    });
  }

  async documentUpdated(event) {
    // never send notifications when batch importing documents
    if (event.data && event.data.source === "import") return;
    const document = await _models.Document.findByPk(event.documentId);
    if (!document) return; // never send notifications for draft documents

    if (!document.publishedAt) return;
    const integration = await _models.Integration.findOne({
      where: {
        teamId: document.teamId,
        collectionId: document.collectionId,
        service: "slack",
        type: "post"
      }
    });
    if (!integration) return;
    const team = await _models.Team.findByPk(document.teamId);
    let text = `${document.updatedBy.name} updated a document`;

    if (event.name === "documents.publish") {
      text = `${document.createdBy.name} published a new document`;
    }

    await (0, _fetchWithProxy.default)(integration.settings.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        attachments: [(0, _presenters.presentSlackAttachment)(document, document.collection, team)]
      })
    });
  }

}

exports.default = Slack;