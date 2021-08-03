"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ApiKey", {
  enumerable: true,
  get: function () {
    return _ApiKey.default;
  }
});
Object.defineProperty(exports, "Attachment", {
  enumerable: true,
  get: function () {
    return _Attachment.default;
  }
});
Object.defineProperty(exports, "AuthenticationProvider", {
  enumerable: true,
  get: function () {
    return _AuthenticationProvider.default;
  }
});
Object.defineProperty(exports, "Backlink", {
  enumerable: true,
  get: function () {
    return _Backlink.default;
  }
});
Object.defineProperty(exports, "Collection", {
  enumerable: true,
  get: function () {
    return _Collection.default;
  }
});
Object.defineProperty(exports, "CollectionGroup", {
  enumerable: true,
  get: function () {
    return _CollectionGroup.default;
  }
});
Object.defineProperty(exports, "CollectionUser", {
  enumerable: true,
  get: function () {
    return _CollectionUser.default;
  }
});
Object.defineProperty(exports, "Document", {
  enumerable: true,
  get: function () {
    return _Document.default;
  }
});
Object.defineProperty(exports, "Event", {
  enumerable: true,
  get: function () {
    return _Event.default;
  }
});
Object.defineProperty(exports, "Group", {
  enumerable: true,
  get: function () {
    return _Group.default;
  }
});
Object.defineProperty(exports, "GroupUser", {
  enumerable: true,
  get: function () {
    return _GroupUser.default;
  }
});
Object.defineProperty(exports, "Integration", {
  enumerable: true,
  get: function () {
    return _Integration.default;
  }
});
Object.defineProperty(exports, "IntegrationAuthentication", {
  enumerable: true,
  get: function () {
    return _IntegrationAuthentication.default;
  }
});
Object.defineProperty(exports, "Notification", {
  enumerable: true,
  get: function () {
    return _Notification.default;
  }
});
Object.defineProperty(exports, "NotificationSetting", {
  enumerable: true,
  get: function () {
    return _NotificationSetting.default;
  }
});
Object.defineProperty(exports, "Revision", {
  enumerable: true,
  get: function () {
    return _Revision.default;
  }
});
Object.defineProperty(exports, "SearchQuery", {
  enumerable: true,
  get: function () {
    return _SearchQuery.default;
  }
});
Object.defineProperty(exports, "Share", {
  enumerable: true,
  get: function () {
    return _Share.default;
  }
});
Object.defineProperty(exports, "Star", {
  enumerable: true,
  get: function () {
    return _Star.default;
  }
});
Object.defineProperty(exports, "Team", {
  enumerable: true,
  get: function () {
    return _Team.default;
  }
});
Object.defineProperty(exports, "User", {
  enumerable: true,
  get: function () {
    return _User.default;
  }
});
Object.defineProperty(exports, "UserAuthentication", {
  enumerable: true,
  get: function () {
    return _UserAuthentication.default;
  }
});
Object.defineProperty(exports, "View", {
  enumerable: true,
  get: function () {
    return _View.default;
  }
});

var _ApiKey = _interopRequireDefault(require("./ApiKey"));

var _Attachment = _interopRequireDefault(require("./Attachment"));

var _AuthenticationProvider = _interopRequireDefault(require("./AuthenticationProvider"));

var _Backlink = _interopRequireDefault(require("./Backlink"));

var _Collection = _interopRequireDefault(require("./Collection"));

var _CollectionGroup = _interopRequireDefault(require("./CollectionGroup"));

var _CollectionUser = _interopRequireDefault(require("./CollectionUser"));

var _Document = _interopRequireDefault(require("./Document"));

var _Event = _interopRequireDefault(require("./Event"));

var _Group = _interopRequireDefault(require("./Group"));

var _GroupUser = _interopRequireDefault(require("./GroupUser"));

var _Integration = _interopRequireDefault(require("./Integration"));

var _IntegrationAuthentication = _interopRequireDefault(require("./IntegrationAuthentication"));

var _Notification = _interopRequireDefault(require("./Notification"));

var _NotificationSetting = _interopRequireDefault(require("./NotificationSetting"));

var _Revision = _interopRequireDefault(require("./Revision"));

var _SearchQuery = _interopRequireDefault(require("./SearchQuery"));

var _Share = _interopRequireDefault(require("./Share"));

var _Star = _interopRequireDefault(require("./Star"));

var _Team = _interopRequireDefault(require("./Team"));

var _User = _interopRequireDefault(require("./User"));

var _UserAuthentication = _interopRequireDefault(require("./UserAuthentication"));

var _View = _interopRequireDefault(require("./View"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const models = {
  ApiKey: _ApiKey.default,
  Attachment: _Attachment.default,
  AuthenticationProvider: _AuthenticationProvider.default,
  Backlink: _Backlink.default,
  Collection: _Collection.default,
  CollectionGroup: _CollectionGroup.default,
  CollectionUser: _CollectionUser.default,
  Document: _Document.default,
  Event: _Event.default,
  Group: _Group.default,
  GroupUser: _GroupUser.default,
  Integration: _Integration.default,
  IntegrationAuthentication: _IntegrationAuthentication.default,
  Notification: _Notification.default,
  NotificationSetting: _NotificationSetting.default,
  Revision: _Revision.default,
  SearchQuery: _SearchQuery.default,
  Share: _Share.default,
  Star: _Star.default,
  Team: _Team.default,
  User: _User.default,
  UserAuthentication: _UserAuthentication.default,
  View: _View.default
}; // based on https://github.com/sequelize/express-example/blob/master/models/index.js

Object.keys(models).forEach(modelName => {
  if ("associate" in models[modelName]) {
    models[modelName].associate(models);
  }
});