"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = attachmentCreator;

var _uuid = require("uuid");

var _models = require("../models");

var _s = require("../utils/s3");

async function attachmentCreator({
  name,
  type,
  buffer,
  user,
  source,
  ip
}) {
  const key = `uploads/${user.id}/${(0, _uuid.v4)()}/${name}`;
  const acl = process.env.AWS_S3_ACL || "private";
  const url = await (0, _s.uploadToS3FromBuffer)(buffer, type, key, acl);
  const attachment = await _models.Attachment.create({
    key,
    acl,
    url,
    size: buffer.length,
    contentType: type,
    teamId: user.teamId,
    userId: user.id
  });
  await _models.Event.create({
    name: "attachments.create",
    data: {
      name,
      source
    },
    modelId: attachment.id,
    teamId: user.teamId,
    actorId: user.id,
    ip
  });
  return attachment;
}