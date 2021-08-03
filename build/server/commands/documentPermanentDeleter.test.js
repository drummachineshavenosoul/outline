"use strict";

var _dateFns = require("date-fns");

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

var _documentPermanentDeleter = require("./documentPermanentDeleter");

jest.mock("aws-sdk", () => {
  const mS3 = {
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  return {
    S3: jest.fn(() => mS3),
    Endpoint: jest.fn()
  };
});
beforeEach(() => (0, _support.flushdb)());
describe("documentPermanentDeleter", () => {
  it("should destroy documents", async () => {
    const document = await (0, _factories.buildDocument)({
      publishedAt: (0, _dateFns.subDays)(new Date(), 90),
      deletedAt: new Date()
    });
    const countDeletedDoc = await (0, _documentPermanentDeleter.documentPermanentDeleter)([document]);
    expect(countDeletedDoc).toEqual(1);
    expect(await _models.Document.unscoped().count({
      paranoid: false
    })).toEqual(0);
  });
  it("should error when trying to destroy undeleted documents", async () => {
    const document = await (0, _factories.buildDocument)({
      publishedAt: new Date()
    });
    let error;

    try {
      await (0, _documentPermanentDeleter.documentPermanentDeleter)([document]);
    } catch (err) {
      error = err.message;
    }

    expect(error).toEqual(`Cannot permanently delete ${document.id} document. Please delete it and try again.`);
  });
  it("should destroy attachments no longer referenced", async () => {
    const document = await (0, _factories.buildDocument)({
      publishedAt: (0, _dateFns.subDays)(new Date(), 90),
      deletedAt: new Date()
    });
    const attachment = await (0, _factories.buildAttachment)({
      teamId: document.teamId,
      documentId: document.id
    });
    document.text = `![text](${attachment.redirectUrl})`;
    await document.save();
    const countDeletedDoc = await (0, _documentPermanentDeleter.documentPermanentDeleter)([document]);
    expect(countDeletedDoc).toEqual(1);
    expect(await _models.Attachment.count()).toEqual(0);
    expect(await _models.Document.unscoped().count({
      paranoid: false
    })).toEqual(0);
  });
  it("should handle unknown attachment ids", async () => {
    const document = await (0, _factories.buildDocument)({
      publishedAt: (0, _dateFns.subDays)(new Date(), 90),
      deletedAt: new Date()
    });
    const attachment = await (0, _factories.buildAttachment)({
      teamId: document.teamId,
      documentId: document.id
    });
    document.text = `![text](${attachment.redirectUrl})`;
    await document.save(); // remove attachment so it no longer exists in the database, this is also
    // representative of a corrupt attachment id in the doc or the regex returning
    // an incorrect string

    await attachment.destroy({
      force: true
    });
    const countDeletedDoc = await (0, _documentPermanentDeleter.documentPermanentDeleter)([document]);
    expect(countDeletedDoc).toEqual(1);
    expect(await _models.Attachment.count()).toEqual(0);
    expect(await _models.Document.unscoped().count({
      paranoid: false
    })).toEqual(0);
  });
  it("should not destroy attachments referenced in other documents", async () => {
    const document1 = await (0, _factories.buildDocument)();
    const document = await (0, _factories.buildDocument)({
      teamId: document1.teamId,
      publishedAt: (0, _dateFns.subDays)(new Date(), 90),
      deletedAt: (0, _dateFns.subDays)(new Date(), 60)
    });
    const attachment = await (0, _factories.buildAttachment)({
      teamId: document1.teamId,
      documentId: document.id
    });
    document1.text = `![text](${attachment.redirectUrl})`;
    await document1.save();
    document.text = `![text](${attachment.redirectUrl})`;
    await document.save();
    expect(await _models.Attachment.count()).toEqual(1);
    const countDeletedDoc = await (0, _documentPermanentDeleter.documentPermanentDeleter)([document]);
    expect(countDeletedDoc).toEqual(1);
    expect(await _models.Attachment.count()).toEqual(1);
    expect(await _models.Document.unscoped().count({
      paranoid: false
    })).toEqual(1);
  });
});