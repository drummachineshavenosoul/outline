"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = revisionCreator;

var _models = require("../models");

var _sequelize = require("../sequelize");

async function revisionCreator({
  document,
  user,
  ip
}) {
  let transaction;

  try {
    transaction = await _sequelize.sequelize.transaction();
    const revision = await _models.Revision.createFromDocument(document, {
      transaction
    });
    await _models.Event.create({
      name: "revisions.create",
      documentId: document.id,
      modelId: revision.id,
      teamId: document.teamId,
      actorId: user.id,
      createdAt: document.updatedAt,
      ip: ip || user.lastActiveIp
    }, {
      transaction
    });
    await transaction.commit();
    return revision;
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }

    throw err;
  }
}