"use strict";

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

/* eslint-disable flowtype/require-valid-file-annotation */
beforeEach(() => (0, _support.flushdb)());
beforeEach(jest.resetAllMocks);
describe("afterDestroy hook", () => {
  test("should destroy associated group and collection join relations", async () => {
    const group = await (0, _factories.buildGroup)();
    const teamId = group.teamId;
    const user1 = await (0, _factories.buildUser)({
      teamId
    });
    const user2 = await (0, _factories.buildUser)({
      teamId
    });
    const collection1 = await (0, _factories.buildCollection)({
      permission: null,
      teamId
    });
    const collection2 = await (0, _factories.buildCollection)({
      permission: null,
      teamId
    });
    const createdById = user1.id;
    await group.addUser(user1, {
      through: {
        createdById
      }
    });
    await group.addUser(user2, {
      through: {
        createdById
      }
    });
    await collection1.addGroup(group, {
      through: {
        createdById
      }
    });
    await collection2.addGroup(group, {
      through: {
        createdById
      }
    });
    let collectionGroupCount = await _models.CollectionGroup.count();
    let groupUserCount = await _models.GroupUser.count();
    expect(collectionGroupCount).toBe(2);
    expect(groupUserCount).toBe(2);
    await group.destroy();
    collectionGroupCount = await _models.CollectionGroup.count();
    groupUserCount = await _models.GroupUser.count();
    expect(collectionGroupCount).toBe(0);
    expect(groupUserCount).toBe(0);
  });
});