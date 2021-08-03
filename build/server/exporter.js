"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exportCollections = void 0;

var _debug = _interopRequireDefault(require("debug"));

var _mailer = _interopRequireDefault(require("./mailer"));

var _models = require("./models");

var _queue = require("./utils/queue");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug.default)("exporter");
const exporterQueue = (0, _queue.createQueue)("exporter");
const queueOptions = {
  attempts: 2,
  removeOnComplete: true,
  backoff: {
    type: "exponential",
    delay: 60 * 1000
  }
};

async function exportAndEmailCollections(teamId, email) {
  log("Archiving team", teamId);

  const {
    archiveCollections
  } = require("./utils/zip");

  const team = await _models.Team.findByPk(teamId);
  const collections = await _models.Collection.findAll({
    where: {
      teamId
    },
    order: [["name", "ASC"]]
  });
  const filePath = await archiveCollections(collections);
  log("Archive path", filePath);

  _mailer.default.export({
    to: email,
    attachments: [{
      filename: `${team.name} Export.zip`,
      path: filePath
    }]
  });
}

exporterQueue.process(async job => {
  log("Process", job.data);

  switch (job.data.type) {
    case "export-collections":
      return await exportAndEmailCollections(job.data.teamId, job.data.email);

    default:
  }
});

const exportCollections = (teamId, email) => {
  exporterQueue.add({
    type: "export-collections",
    teamId,
    email
  }, queueOptions);
};

exports.exportCollections = exportCollections;