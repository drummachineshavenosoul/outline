"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CollectionNotificationEmail = exports.collectionNotificationEmailText = void 0;

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

const collectionNotificationEmailText = ({
  actor,
  collection,
  eventName = "created"
}) => `
${collection.name}

${actor.name} ${eventName} the collection "${collection.name}"

Open Collection: ${process.env.URL}${collection.url}
`;

exports.collectionNotificationEmailText = collectionNotificationEmailText;

const CollectionNotificationEmail = ({
  actor,
  collection,
  eventName = "created",
  unsubscribeUrl
}) => {
  return /*#__PURE__*/React.createElement(_EmailLayout.default, null, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, collection.name), /*#__PURE__*/React.createElement("p", null, actor.name, " ", eventName, " the collection \"", collection.name, "\"."), /*#__PURE__*/React.createElement(_EmptySpace.default, {
    height: 10
  }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
    href: `${process.env.URL}${collection.url}`
  }, "Open Collection"))), /*#__PURE__*/React.createElement(_Footer.default, {
    unsubscribeUrl: unsubscribeUrl
  }));
};

exports.CollectionNotificationEmail = CollectionNotificationEmail;