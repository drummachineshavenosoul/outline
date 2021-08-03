"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InviteEmail = exports.inviteEmailText = void 0;

var React = _interopRequireWildcard(require("react"));

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

const inviteEmailText = ({
  teamName,
  actorName,
  actorEmail,
  teamUrl
}) => `
Join ${teamName} on Outline

${actorName} (${actorEmail}) has invited you to join Outline, a place for your team to build and share knowledge.

Join now: ${teamUrl}
`;

exports.inviteEmailText = inviteEmailText;

const InviteEmail = ({
  teamName,
  actorName,
  actorEmail,
  teamUrl
}) => {
  return /*#__PURE__*/React.createElement(_EmailLayout.default, null, /*#__PURE__*/React.createElement(_Header.default, null), /*#__PURE__*/React.createElement(_Body.default, null, /*#__PURE__*/React.createElement(_Heading.default, null, "Join ", teamName, " on Outline"), /*#__PURE__*/React.createElement("p", null, actorName, " (", actorEmail, ") has invited you to join Outline, a place for your team to build and share knowledge."), /*#__PURE__*/React.createElement(_EmptySpace.default, {
    height: 10
  }), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement(_Button.default, {
    href: teamUrl
  }, "Join now"))), /*#__PURE__*/React.createElement(_Footer.default, null));
};

exports.InviteEmail = InviteEmail;