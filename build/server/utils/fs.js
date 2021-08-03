"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeFilename = serializeFilename;
exports.deserializeFilename = deserializeFilename;
exports.requireDirectory = requireDirectory;

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function serializeFilename(text) {
  return text.replace(/\//g, "%2F").replace(/\\/g, "%5C");
}

function deserializeFilename(text) {
  return text.replace(/%2F/g, "/").replace(/%5C/g, "\\");
}

function requireDirectory(dirName) {
  return _fsExtra.default.readdirSync(dirName).filter(file => file.indexOf(".") !== 0 && file.endsWith(".js") && file !== _path.default.basename(__filename) && !file.includes(".test")).map(fileName => {
    const filePath = _path.default.join(dirName, fileName);

    const name = _path.default.basename(filePath.replace(/\.js$/, "")); // $FlowIssue


    return [require(filePath), name];
  });
}