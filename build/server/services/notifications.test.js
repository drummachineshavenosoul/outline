"use strict";

var _mailer = _interopRequireDefault(require("../mailer"));

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

var _notifications = _interopRequireDefault(require("./notifications"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
jest.mock("../mailer");
const Notifications = new _notifications.default();
beforeEach(() => (0, _support.flushdb)());
beforeEach(jest.resetAllMocks);
describe("documents.publish", () => {
  test("should not send a notification to author", async () => {
    const user = await (0, _factories.buildUser)();
    const document = await (0, _factories.buildDocument)({
      teamId: user.teamId,
      lastModifiedById: user.id
    });
    await _models.NotificationSetting.create({
      userId: user.id,
      teamId: user.teamId,
      event: "documents.publish"
    });
    await Notifications.on({
      name: "documents.publish",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    expect(_mailer.default.documentNotification).not.toHaveBeenCalled();
  });
  test("should send a notification to other users in team", async () => {
    const user = await (0, _factories.buildUser)();
    const document = await (0, _factories.buildDocument)({
      teamId: user.teamId
    });
    await _models.NotificationSetting.create({
      userId: user.id,
      teamId: user.teamId,
      event: "documents.publish"
    });
    await Notifications.on({
      name: "documents.publish",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    expect(_mailer.default.documentNotification).toHaveBeenCalled();
  });
  test("should not send a notification to users without collection access", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      permission: null
    });
    const document = await (0, _factories.buildDocument)({
      teamId: user.teamId,
      collectionId: collection.id
    });
    await _models.NotificationSetting.create({
      userId: user.id,
      teamId: user.teamId,
      event: "documents.publish"
    });
    await Notifications.on({
      name: "documents.publish",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    expect(_mailer.default.documentNotification).not.toHaveBeenCalled();
  });
});
describe("documents.update.debounced", () => {
  test("should send a notification to other collaborator", async () => {
    const document = await (0, _factories.buildDocument)();
    const collaborator = await (0, _factories.buildUser)({
      teamId: document.teamId
    });
    document.collaboratorIds = [collaborator.id];
    await document.save();
    await _models.NotificationSetting.create({
      userId: collaborator.id,
      teamId: collaborator.teamId,
      event: "documents.update"
    });
    await Notifications.on({
      name: "documents.update.debounced",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    expect(_mailer.default.documentNotification).toHaveBeenCalled();
  });
  test("should not send a notification if viewed since update", async () => {
    const document = await (0, _factories.buildDocument)();
    const collaborator = await (0, _factories.buildUser)({
      teamId: document.teamId
    });
    document.collaboratorIds = [collaborator.id];
    await document.save();
    await _models.NotificationSetting.create({
      userId: collaborator.id,
      teamId: collaborator.teamId,
      event: "documents.update"
    });
    await _models.View.touch(document.id, collaborator.id, true);
    await Notifications.on({
      name: "documents.update.debounced",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    expect(_mailer.default.documentNotification).not.toHaveBeenCalled();
  });
  test("should not send a notification to last editor", async () => {
    const user = await (0, _factories.buildUser)();
    const document = await (0, _factories.buildDocument)({
      teamId: user.teamId,
      lastModifiedById: user.id
    });
    await _models.NotificationSetting.create({
      userId: user.id,
      teamId: user.teamId,
      event: "documents.update"
    });
    await Notifications.on({
      name: "documents.update.debounced",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: document.createdById
    });
    expect(_mailer.default.documentNotification).not.toHaveBeenCalled();
  });
});