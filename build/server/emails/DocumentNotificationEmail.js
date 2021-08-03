"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DocumentNotificationEmail = exports.documentNotificationEmailText = void 0;

var React = _interopRequireWildcard(require("react"));

var _models = require("../models");

var _Body = _interopRequireDefault(require("./components/Body"));

var _Button = _interopRequireDefault(require("./components/Button"));

var _EmailLayout = _interopRequireDefault(require("./components/EmailLayout"));

var _EmptySpace = _interopRequireDefault(require("./components/EmptySpace"));

var _Footer = _interopRequireDefault(require("./components/Footer"));

var _Header = _interopRequireDefault(require("./components/Header"));

var _Heading = _interopRequireDefault(require("./components/Heading"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const documentNotificationEmailText = ({
  actor,
  team,
  document,
  collection,
  eventName = "published"
}) => `
"${document.title}" ${eventName}

${actor.name} ${eventName} the document "${document.title}", in the ${collection.name} collection.

Open Document: ${team.url}${document.url}
`;

exports.documentNotificationEmailText = documentNotificationEmailText;

const DocumentNotificationEmail = ({
  actor,
  team,
  document,
  collection,
  eventName = "published",
  unsubscribeUrl
}) => {
  return /*#__PURE__*/React.createElement(_EmailLayout.default, null, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, "\"", document.title, "\" ", eventName), /*#__PURE__*/React.createElement("p", null, actor.name, " ", eventName, " the document \"", document.title, "\", in the", " ", collection.name, " collection."), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(_EmptySpace.default, {
    height: 10
  }), /*#__PURE__*/React.createElement("p", null, document.getSummary()), /*#__PURE__*/React.createElement(_EmptySpace.default, {
    height: 10
  }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
    href: `${team.url}${document.url}`
  }, "Open Document"))), /*#__PURE__*/React.createElement(_Footer.default, {
    unsubscribeUrl: unsubscribeUrl
  }));
};

exports.DocumentNotificationEmail = DocumentNotificationEmail;