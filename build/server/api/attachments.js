"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dateFns = require("date-fns");

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _uuid = require("uuid");

var _errors = require("../errors");

var _authentication = _interopRequireDefault(require("../middlewares/authentication"));

var _models = require("../models");

var _policies = _interopRequireDefault(require("../policies"));

var _s = require("../utils/s3");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  authorize
} = _policies.default;
const router = new _koaRouter.default();
const AWS_S3_ACL = process.env.AWS_S3_ACL || "private";
router.post("attachments.create", (0, _authentication.default)(), async ctx => {
  let {
    name,
    documentId,
    contentType,
    size
  } = ctx.body;
  ctx.assertPresent(name, "name is required");
  ctx.assertPresent(contentType, "contentType is required");
  ctx.assertPresent(size, "size is required");
  const {
    user
  } = ctx.state;
  authorize(user, "createAttachment", user.team);
  const s3Key = (0, _uuid.v4)();
  const acl = ctx.body.public === undefined ? AWS_S3_ACL : ctx.body.public ? "public-read" : "private";
  const bucket = acl === "public-read" ? "public" : "uploads";
  const key = `${bucket}/${user.id}/${s3Key}/${name}`;
  const credential = (0, _s.makeCredential)();
  const longDate = (0, _dateFns.format)(new Date(), "yyyyMMdd'T'HHmmss'Z'");
  const policy = (0, _s.makePolicy)(credential, longDate, acl, contentType);
  const endpoint = (0, _s.publicS3Endpoint)();
  const url = `${endpoint}/${key}`;

  if (documentId) {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id
    });
    authorize(user, "update", document);
  }

  const attachment = await _models.Attachment.create({
    key,
    acl,
    size,
    url,
    contentType,
    documentId,
    teamId: user.teamId,
    userId: user.id
  });
  await _models.Event.create({
    name: "attachments.create",
    data: {
      name
    },
    teamId: user.teamId,
    userId: user.id,
    ip: ctx.request.ip
  });
  ctx.body = {
    data: {
      maxUploadSize: process.env.AWS_S3_UPLOAD_MAX_SIZE,
      uploadUrl: endpoint,
      form: {
        "Cache-Control": "max-age=31557600",
        "Content-Type": contentType,
        acl,
        key,
        policy,
        "x-amz-algorithm": "AWS4-HMAC-SHA256",
        "x-amz-credential": credential,
        "x-amz-date": longDate,
        "x-amz-signature": (0, _s.getSignature)(policy)
      },
      attachment: {
        documentId,
        contentType,
        name,
        id: attachment.id,
        url: attachment.redirectUrl,
        size
      }
    }
  };
});
router.post("attachments.delete", (0, _authentication.default)(), async ctx => {
  let {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const attachment = await _models.Attachment.findByPk(id);

  if (!attachment) {
    throw new _errors.NotFoundError();
  }

  if (attachment.documentId) {
    const document = await _models.Document.findByPk(attachment.documentId, {
      userId: user.id
    });
    authorize(user, "update", document);
  }

  authorize(user, "delete", attachment);
  await attachment.destroy();
  await _models.Event.create({
    name: "attachments.delete",
    teamId: user.teamId,
    userId: user.id,
    ip: ctx.request.ip
  });
  ctx.body = {
    success: true
  };
});
router.post("attachments.redirect", (0, _authentication.default)(), async ctx => {
  const {
    id
  } = ctx.body;
  ctx.assertPresent(id, "id is required");
  const user = ctx.state.user;
  const attachment = await _models.Attachment.findByPk(id);

  if (!attachment) {
    throw new _errors.NotFoundError();
  }

  if (attachment.isPrivate) {
    if (attachment.documentId) {
      const document = await _models.Document.findByPk(attachment.documentId, {
        userId: user.id,
        paranoid: false
      });
      authorize(user, "read", document);
    }

    const accessUrl = await (0, _s.getSignedImageUrl)(attachment.key);
    ctx.redirect(accessUrl);
  } else {
    ctx.redirect(attachment.url);
  }
});
var _default = router;
exports.default = _default;