"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var React = _interopRequireWildcard(require("react"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _env = _interopRequireDefault(require("../env"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const prefetchTags = [];

if (process.env.AWS_S3_UPLOAD_BUCKET_URL) {
  prefetchTags.push( /*#__PURE__*/React.createElement("link", {
    rel: "dns-prefetch",
    href: process.env.AWS_S3_UPLOAD_BUCKET_URL,
    key: "dns"
  }));
}

let manifestData = {};

try {
  const manifest = _fs.default.readFileSync(_path.default.join(__dirname, "../../app/manifest.json"), "utf8");

  manifestData = JSON.parse(manifest);
} catch (err) {// no-op
}

let index = 0;
Object.values(manifestData).forEach(filename => {
  if (typeof filename !== "string") return;
  if (!_env.default.CDN_URL) return;

  if (filename.endsWith(".js")) {
    //  Preload resources you have high-confidence will be used in the current
    // page.Prefetch resources likely to be used for future navigations
    const shouldPreload = filename.includes("/main") || filename.includes("/runtime") || filename.includes("/vendors"); // only prefetch the first few javascript chunks or it gets out of hand fast

    const shouldPrefetch = ++index <= 6;

    if (shouldPreload || shouldPrefetch) {
      prefetchTags.push( /*#__PURE__*/React.createElement("link", {
        rel: shouldPreload ? "preload" : "prefetch",
        href: filename,
        key: filename,
        as: "script"
      }));
    }
  } else if (filename.endsWith(".css")) {
    prefetchTags.push( /*#__PURE__*/React.createElement("link", {
      rel: "prefetch",
      href: filename,
      key: filename,
      as: "style"
    }));
  }
});

var _default = _server.default.renderToString(prefetchTags);

exports.default = _default;