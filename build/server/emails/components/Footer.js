"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _oyVey = require("oy-vey");

var React = _interopRequireWildcard(require("react"));

var _theme = _interopRequireDefault(require("../../../shared/theme"));

var _routeHelpers = require("../../../shared/utils/routeHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = ({
  unsubscribeUrl
}) => {
  const footerStyle = {
    padding: "20px 0",
    borderTop: `1px solid ${_theme.default.smokeDark}`,
    color: _theme.default.slate,
    fontSize: "14px"
  };
  const unsubStyle = {
    padding: "0",
    color: _theme.default.slate,
    fontSize: "14px"
  };
  const linkStyle = {
    color: _theme.default.slate,
    fontWeight: 500,
    textDecoration: "none",
    marginRight: "10px"
  };
  const externalLinkStyle = {
    color: _theme.default.slate,
    textDecoration: "none",
    margin: "0 10px"
  };
  return /*#__PURE__*/React.createElement(_oyVey.Table, {
    width: "100%"
  }, /*#__PURE__*/React.createElement(_oyVey.TBody, null, /*#__PURE__*/React.createElement(_oyVey.TR, null, /*#__PURE__*/React.createElement(_oyVey.TD, {
    style: footerStyle
  }, /*#__PURE__*/React.createElement("a", {
    href: process.env.URL,
    style: linkStyle
  }, "Outline"), /*#__PURE__*/React.createElement("a", {
    href: (0, _routeHelpers.twitterUrl)(),
    style: externalLinkStyle
  }, "Twitter"))), unsubscribeUrl && /*#__PURE__*/React.createElement(_oyVey.TR, null, /*#__PURE__*/React.createElement(_oyVey.TD, {
    style: unsubStyle
  }, /*#__PURE__*/React.createElement("a", {
    href: unsubscribeUrl,
    style: linkStyle
  }, "Unsubscribe from these emails")))));
};

exports.default = _default;