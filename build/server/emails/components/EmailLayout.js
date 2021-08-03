"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.baseStyles = exports.default = void 0;

var _oyVey = require("oy-vey");

var React = _interopRequireWildcard(require("react"));

var _theme = _interopRequireDefault(require("../../../shared/theme"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = props => /*#__PURE__*/React.createElement(_oyVey.Table, {
  width: "550",
  padding: "40"
}, /*#__PURE__*/React.createElement(_oyVey.TBody, null, /*#__PURE__*/React.createElement(_oyVey.TR, null, /*#__PURE__*/React.createElement(_oyVey.TD, {
  align: "left"
}, props.children))));

exports.default = _default;
const baseStyles = `
  #__bodyTable__ {
    font-family: ${_theme.default.fontFamily};
    font-size: 16px;
    line-height: 1.5;
  }
`;
exports.baseStyles = baseStyles;