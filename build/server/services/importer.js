"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _os = _interopRequireDefault(require("os"));

var _file = _interopRequireDefault(require("formidable/lib/file"));

var _collectionImporter = _interopRequireDefault(require("../commands/collectionImporter"));

var _models = require("../models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Importer {
  async on(event) {
    switch (event.name) {
      case "collections.import":
        {
          const {
            type
          } = event.data;
          const attachment = await _models.Attachment.findByPk(event.modelId);
          const user = await _models.User.findByPk(event.actorId);
          const buffer = await attachment.buffer;

          const tmpDir = _os.default.tmpdir();

          const tmpFilePath = `${tmpDir}/upload-${event.modelId}`;
          await _fs.default.promises.writeFile(tmpFilePath, buffer);
          const file = new _file.default({
            name: attachment.name,
            type: attachment.type,
            path: tmpFilePath
          });
          await (0, _collectionImporter.default)({
            file,
            user,
            type,
            ip: event.ip
          });
          await attachment.destroy();
          return;
        }

      default:
    }
  }

}

exports.default = Importer;