"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;

require("./bootstrap");

var _models = require("../models");

let limit = 100;
let page = parseInt(process.argv[2], 10);
page = Number.isNaN(page) ? 0 : page;

async function main(exit = false) {
  const work = async page => {
    console.log(`Backfill revision events… page ${page}`);
    const revisions = await _models.Revision.findAll({
      limit,
      offset: page * limit,
      order: [["createdAt", "DESC"]],
      include: [{
        model: _models.Document,
        as: "document",
        required: true,
        paranoid: false
      }]
    });

    for (const revision of revisions) {
      try {
        await _models.Event.findOrCreate({
          where: {
            name: "revisions.create",
            modelId: revision.id,
            documentId: revision.documentId,
            actorId: revision.userId,
            teamId: revision.document.teamId
          },
          defaults: {
            createdAt: revision.createdAt
          }
        });
      } catch (err) {
        console.error(`Failed at ${revision.id}:`, err);
        continue;
      }
    }

    return revisions.length === limit ? work(page + 1) : undefined;
  };

  await work(page);

  if (exit) {
    console.log("Backfill complete");
    process.exit(0);
  }
} // In the test suite we import the script rather than run via node CLI


if (process.env.NODE_ENV !== "test") {
  main(true);
}