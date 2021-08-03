"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentCreator;

var _models = require("../models");

async function documentCreator({
  title = "",
  text = "",
  publish,
  collectionId,
  parentDocumentId,
  templateDocument,
  createdAt,
  // allows override for import
  updatedAt,
  template,
  index,
  user,
  editorVersion,
  source,
  ip
}) {
  const templateId = templateDocument ? templateDocument.id : undefined;
  let document = await _models.Document.create({
    parentDocumentId,
    editorVersion,
    collectionId,
    teamId: user.teamId,
    userId: user.id,
    createdAt,
    updatedAt,
    lastModifiedById: user.id,
    createdById: user.id,
    template,
    templateId,
    title: templateDocument ? templateDocument.title : title,
    text: templateDocument ? templateDocument.text : text
  });
  await _models.Event.create({
    name: "documents.create",
    documentId: document.id,
    collectionId: document.collectionId,
    teamId: document.teamId,
    actorId: user.id,
    data: {
      source,
      title: document.title,
      templateId
    },
    ip
  });

  if (publish) {
    await document.publish(user.id);
    await _models.Event.create({
      name: "documents.publish",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: user.id,
      data: {
        source,
        title: document.title
      },
      ip
    });
  } // reload to get all of the data needed to present (user, collection etc)
  // we need to specify publishedAt to bypass default scope that only returns
  // published documents


  return _models.Document.findOne({
    where: {
      id: document.id,
      publishedAt: document.publishedAt
    }
  });
}