"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = editor;

var _package = _interopRequireDefault(require("rich-markdown-editor/package.json"));

var _semver = _interopRequireDefault(require("semver"));

var _errors = require("../../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function editor() {
  return async function editorMiddleware(ctx, next) {
    const clientVersion = ctx.headers["x-editor-version"]; // If the editor version on the client is behind the current version being
    // served in production by either a minor (new features), or major (breaking
    // changes) then force a client reload.

    if (clientVersion) {
      const parsedClientVersion = _semver.default.parse(clientVersion);

      const parsedCurrentVersion = _semver.default.parse(_package.default.version);

      if (parsedClientVersion.major < parsedCurrentVersion.major || parsedClientVersion.minor < parsedCurrentVersion.minor) {
        throw new _errors.EditorUpdateError();
      }
    }

    return next();
  };
}