"use strict";

var _fetchTestServer = _interopRequireDefault(require("fetch-test-server"));

var _app = _interopRequireDefault(require("../app"));

var _models = require("../models");

var _factories = require("../test/factories");

var _support = require("../test/support");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
const server = new _fetchTestServer.default(_app.default.callback());
beforeEach(() => (0, _support.flushdb)());
afterAll(() => server.close());
describe("#collections.list", () => {
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.list");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should return collections", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.list", {
      body: {
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
    expect(body.data[0].id).toEqual(collection.id);
    expect(body.policies.length).toEqual(1);
    expect(body.policies[0].abilities.read).toEqual(true);
  });
  it("should not return private collections actor is not a member of", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.list", {
      body: {
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
    expect(body.data[0].id).toEqual(collection.id);
  });
  it("should return private collections actor is a member of", async () => {
    const user = await (0, _factories.buildUser)();
    await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId,
      userId: user.id
    });
    await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId,
      userId: user.id
    });
    const res = await server.post("/api/collections.list", {
      body: {
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(2);
    expect(body.policies.length).toEqual(2);
    expect(body.policies[0].abilities.read).toEqual(true);
  });
  it("should return private collections actor is a group-member of", async () => {
    const user = await (0, _factories.buildUser)();
    await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId,
      userId: user.id
    });
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    await group.addUser(user, {
      through: {
        createdById: user.id
      }
    });
    await collection.addGroup(group, {
      through: {
        permission: "read",
        createdById: user.id
      }
    });
    const res = await server.post("/api/collections.list", {
      body: {
        token: user.getJwtToken()
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(2);
    expect(body.policies.length).toEqual(2);
    expect(body.policies[0].abilities.read).toEqual(true);
  });
});
describe("#collections.import", () => {
  it("should error if no attachmentId is passed", async () => {
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.import", {
      body: {
        token: user.getJwtToken()
      }
    });
    expect(res.status).toEqual(400);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.import");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
});
describe("#collections.move", () => {
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.move");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const user = await (0, _factories.buildUser)();
    const {
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.move", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        index: "P"
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should return success", async () => {
    const {
      admin,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.move", {
      body: {
        token: admin.getJwtToken(),
        id: collection.id,
        index: "P"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.success).toBe(true);
  });
  it("should return error when index is not valid", async () => {
    const {
      admin,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.move", {
      body: {
        token: admin.getJwtToken(),
        id: collection.id,
        index: "يونيكود"
      }
    });
    expect(res.status).toEqual(400);
  });
  it("if index collision occurs, should updated index of other collection", async () => {
    const {
      user,
      admin,
      collection
    } = await (0, _support.seed)();
    const createdCollectionResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "Test",
        sharing: false,
        index: "Q"
      }
    });
    await createdCollectionResponse.json();
    const movedCollectionRes = await server.post("/api/collections.move", {
      body: {
        token: admin.getJwtToken(),
        id: collection.id,
        index: "Q"
      }
    });
    const movedCollection = await movedCollectionRes.json();
    expect(movedCollectionRes.status).toEqual(200);
    expect(movedCollection.success).toBe(true);
    expect(movedCollection.data.index).toEqual("h");
    expect(movedCollection.data.index > "Q").toBeTruthy();
  });
  it("if index collision with an extra collection, should updated index of other collection", async () => {
    const {
      user,
      admin
    } = await (0, _support.seed)();
    const createdCollectionAResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "A",
        sharing: false,
        index: "a"
      }
    });
    const createdCollectionBResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "B",
        sharing: false,
        index: "b"
      }
    });
    const createdCollectionCResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "C",
        sharing: false,
        index: "c"
      }
    });
    await createdCollectionAResponse.json();
    await createdCollectionBResponse.json();
    const createdCollectionC = await createdCollectionCResponse.json();
    const movedCollectionCResponse = await server.post("/api/collections.move", {
      body: {
        token: admin.getJwtToken(),
        id: createdCollectionC.data.id,
        index: "a"
      }
    });
    const movedCollectionC = await movedCollectionCResponse.json();
    expect(movedCollectionCResponse.status).toEqual(200);
    expect(movedCollectionC.success).toBe(true);
    expect(movedCollectionC.data.index).toEqual("aP");
    expect(movedCollectionC.data.index > "a").toBeTruthy();
    expect(movedCollectionC.data.index < "b").toBeTruthy();
  });
});
describe("#collections.export", () => {
  it("should now allow export of private collection not a member", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.export", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should allow export of private collection when the actor is a member", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read_write"
    });
    const res = await server.post("/api/collections.export", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(200);
  });
  it("should allow export of private collection when the actor is a group member", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    await group.addUser(user, {
      through: {
        createdById: user.id
      }
    });
    await collection.addGroup(group, {
      through: {
        permission: "read_write",
        createdById: user.id
      }
    });
    const res = await server.post("/api/collections.export", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(200);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.export");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should return success", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.export", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(200);
  });
});
describe("#collections.export_all", () => {
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.export_all");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.export_all", {
      body: {
        token: user.getJwtToken()
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should return success", async () => {
    const {
      admin
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.export_all", {
      body: {
        token: admin.getJwtToken()
      }
    });
    expect(res.status).toEqual(200);
  });
  it("should allow downloading directly", async () => {
    const {
      admin
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.export_all", {
      body: {
        token: admin.getJwtToken(),
        download: true
      }
    });
    expect(res.status).toEqual(200);
    expect(res.headers.get("content-type")).toEqual("application/force-download");
  });
});
describe("#collections.add_user", () => {
  it("should add user to collection", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      userId: user.id,
      permission: null
    });
    const anotherUser = await (0, _factories.buildUser)({
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.add_user", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        userId: anotherUser.id
      }
    });
    const users = await collection.getUsers();
    expect(res.status).toEqual(200);
    expect(users.length).toEqual(2);
  });
  it("should require user in team", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      permission: null
    });
    const anotherUser = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.add_user", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        userId: anotherUser.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(403);
    expect(body).toMatchSnapshot();
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.add_user");
    expect(res.status).toEqual(401);
  });
  it("should require authorization", async () => {
    const {
      collection
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const anotherUser = await (0, _factories.buildUser)({
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.add_user", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        userId: anotherUser.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#collections.add_group", () => {
  it("should add group to collection", async () => {
    const user = await (0, _factories.buildAdmin)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      userId: user.id,
      permission: null
    });
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.add_group", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        groupId: group.id
      }
    });
    const groups = await collection.getGroups();
    expect(groups.length).toEqual(1);
    expect(res.status).toEqual(200);
  });
  it("should require group in team", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      userId: user.id,
      permission: null
    });
    const group = await (0, _factories.buildGroup)();
    const res = await server.post("/api/collections.add_group", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        groupId: group.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(403);
    expect(body).toMatchSnapshot();
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.add_group");
    expect(res.status).toEqual(401);
  });
  it("should require authorization", async () => {
    const collection = await (0, _factories.buildCollection)();
    const user = await (0, _factories.buildUser)();
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.add_group", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        groupId: group.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#collections.remove_group", () => {
  it("should remove group from collection", async () => {
    const user = await (0, _factories.buildAdmin)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      userId: user.id,
      permission: null
    });
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    await server.post("/api/collections.add_group", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        groupId: group.id
      }
    });
    let users = await collection.getGroups();
    expect(users.length).toEqual(1);
    const res = await server.post("/api/collections.remove_group", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        groupId: group.id
      }
    });
    users = await collection.getGroups();
    expect(res.status).toEqual(200);
    expect(users.length).toEqual(0);
  });
  it("should require group in team", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      permission: null
    });
    const group = await (0, _factories.buildGroup)();
    const res = await server.post("/api/collections.remove_group", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        groupId: group.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(403);
    expect(body).toMatchSnapshot();
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.remove_group");
    expect(res.status).toEqual(401);
  });
  it("should require authorization", async () => {
    const {
      collection
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.remove_group", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        groupId: group.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#collections.remove_user", () => {
  it("should remove user from collection", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      userId: user.id,
      permission: null
    });
    const anotherUser = await (0, _factories.buildUser)({
      teamId: user.teamId
    });
    await server.post("/api/collections.add_user", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        userId: anotherUser.id
      }
    });
    const res = await server.post("/api/collections.remove_user", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        userId: anotherUser.id
      }
    });
    const users = await collection.getUsers();
    expect(res.status).toEqual(200);
    expect(users.length).toEqual(1);
  });
  it("should require user in team", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      teamId: user.teamId,
      permission: null
    });
    const anotherUser = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.remove_user", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        userId: anotherUser.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(403);
    expect(body).toMatchSnapshot();
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.remove_user");
    expect(res.status).toEqual(401);
  });
  it("should require authorization", async () => {
    const {
      collection
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const anotherUser = await (0, _factories.buildUser)({
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.remove_user", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        userId: anotherUser.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#collections.users", () => {
  it("should return users in private collection", async () => {
    const {
      collection,
      user
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read"
    });
    const res = await server.post("/api/collections.users", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.length).toEqual(1);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.users");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const {
      collection
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.users", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#collections.group_memberships", () => {
  it("should return groups in private collection", async () => {
    const user = await (0, _factories.buildUser)();
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read_write"
    });
    await _models.CollectionGroup.create({
      createdById: user.id,
      collectionId: collection.id,
      groupId: group.id,
      permission: "read_write"
    });
    const res = await server.post("/api/collections.group_memberships", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.groups.length).toEqual(1);
    expect(body.data.groups[0].id).toEqual(group.id);
    expect(body.data.collectionGroupMemberships.length).toEqual(1);
    expect(body.data.collectionGroupMemberships[0].permission).toEqual("read_write");
  });
  it("should allow filtering groups in collection by name", async () => {
    const user = await (0, _factories.buildUser)();
    const group = await (0, _factories.buildGroup)({
      name: "will find",
      teamId: user.teamId
    });
    const group2 = await (0, _factories.buildGroup)({
      name: "wont find",
      teamId: user.teamId
    });
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read_write"
    });
    await _models.CollectionGroup.create({
      createdById: user.id,
      collectionId: collection.id,
      groupId: group.id,
      permission: "read_write"
    });
    await _models.CollectionGroup.create({
      createdById: user.id,
      collectionId: collection.id,
      groupId: group2.id,
      permission: "read_write"
    });
    const res = await server.post("/api/collections.group_memberships", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        query: "will"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.groups.length).toEqual(1);
    expect(body.data.groups[0].id).toEqual(group.id);
  });
  it("should allow filtering groups in collection by permission", async () => {
    const user = await (0, _factories.buildUser)();
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    const group2 = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read_write"
    });
    await _models.CollectionGroup.create({
      createdById: user.id,
      collectionId: collection.id,
      groupId: group.id,
      permission: "read_write"
    });
    await _models.CollectionGroup.create({
      createdById: user.id,
      collectionId: collection.id,
      groupId: group2.id,
      permission: "maintainer"
    });
    const res = await server.post("/api/collections.group_memberships", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        permission: "maintainer"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.groups.length).toEqual(1);
    expect(body.data.groups[0].id).toEqual(group2.id);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.group_memberships");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    const res = await server.post("/api/collections.group_memberships", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#collections.memberships", () => {
  it("should return members in private collection", async () => {
    const {
      collection,
      user
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read_write"
    });
    const res = await server.post("/api/collections.memberships", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.users.length).toEqual(1);
    expect(body.data.users[0].id).toEqual(user.id);
    expect(body.data.memberships.length).toEqual(1);
    expect(body.data.memberships[0].permission).toEqual("read_write");
  });
  it("should allow filtering members in collection by name", async () => {
    const {
      collection,
      user
    } = await (0, _support.seed)();
    const user2 = await (0, _factories.buildUser)({
      name: "Won't find"
    });
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read_write"
    });
    await _models.CollectionUser.create({
      createdById: user2.id,
      collectionId: collection.id,
      userId: user2.id,
      permission: "read_write"
    });
    const res = await server.post("/api/collections.memberships", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        query: user.name.slice(0, 3)
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.users.length).toEqual(1);
    expect(body.data.users[0].id).toEqual(user.id);
  });
  it("should allow filtering members in collection by permission", async () => {
    const {
      collection,
      user
    } = await (0, _support.seed)();
    const user2 = await (0, _factories.buildUser)();
    await _models.CollectionUser.create({
      createdById: user.id,
      collectionId: collection.id,
      userId: user.id,
      permission: "read_write"
    });
    await _models.CollectionUser.create({
      createdById: user2.id,
      collectionId: collection.id,
      userId: user2.id,
      permission: "maintainer"
    });
    const res = await server.post("/api/collections.memberships", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        permission: "maintainer"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.users.length).toEqual(1);
    expect(body.data.users[0].id).toEqual(user2.id);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.memberships");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const {
      collection
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.memberships", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#collections.info", () => {
  it("should return collection", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.info", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.id).toEqual(collection.id);
  });
  it("should require user member of collection", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    const res = await server.post("/api/collections.info", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should allow user member of collection", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      collectionId: collection.id,
      userId: user.id,
      createdById: user.id,
      permission: "read"
    });
    const res = await server.post("/api/collections.info", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.id).toEqual(collection.id);
  });
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.info");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const {
      collection
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.info", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(403);
  });
});
describe("#collections.create", () => {
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.create");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should create collection", async () => {
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "Test"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.id).toBeTruthy();
    expect(body.data.name).toBe("Test");
    expect(body.data.sort.field).toBe("index");
    expect(body.data.sort.direction).toBe("asc");
    expect(body.policies.length).toBe(1);
    expect(body.policies[0].abilities.read).toBeTruthy();
    expect(body.policies[0].abilities.export).toBeTruthy();
  });
  it("should error when index is invalid", async () => {
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "Test",
        index: "يونيكود"
      }
    });
    expect(res.status).toEqual(400);
  });
  it("should allow setting sharing to false", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "Test",
        sharing: false
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.id).toBeTruthy();
    expect(body.data.sharing).toBe(false);
  });
  it("should return correct policies with private collection", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "Test",
        permission: null
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.permission).toEqual(null);
    expect(body.policies.length).toBe(1);
    expect(body.policies[0].abilities.read).toBeTruthy();
    expect(body.policies[0].abilities.export).toBeTruthy();
  });
  it("if index collision, should updated index of other collection", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const createdCollectionAResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "A",
        sharing: false,
        index: "a"
      }
    });
    await createdCollectionAResponse.json();
    const createCollectionResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "C",
        sharing: false,
        index: "a"
      }
    });
    const createdCollection = await createCollectionResponse.json();
    expect(createCollectionResponse.status).toEqual(200);
    expect(createdCollection.data.index).toEqual("p");
    expect(createdCollection.data.index > "a").toBeTruthy();
  });
  it("if index collision with an extra collection, should updated index of other collection", async () => {
    const {
      user
    } = await (0, _support.seed)();
    const createdCollectionAResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "A",
        sharing: false,
        index: "a"
      }
    });
    const createdCollectionBResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "B",
        sharing: false,
        index: "b"
      }
    });
    await createdCollectionAResponse.json();
    await createdCollectionBResponse.json();
    const createCollectionResponse = await server.post("/api/collections.create", {
      body: {
        token: user.getJwtToken(),
        name: "C",
        sharing: false,
        index: "a"
      }
    });
    const createdCollection = await createCollectionResponse.json();
    expect(createCollectionResponse.status).toEqual(200);
    expect(createdCollection.data.index).toEqual("aP");
    expect(createdCollection.data.index > "a").toBeTruthy();
    expect(createdCollection.data.index < "b").toBeTruthy();
  });
});
describe("#collections.update", () => {
  it("should require authentication", async () => {
    const collection = await (0, _factories.buildCollection)();
    const res = await server.post("/api/collections.update", {
      body: {
        id: collection.id,
        name: "Test"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const {
      collection
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        name: "Test"
      }
    });
    expect(res.status).toEqual(403);
  });
  it("allows editing non-private collection", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        name: "Test"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toBe("Test");
    expect(body.policies.length).toBe(1);
  });
  it("allows editing sort", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const sort = {
      field: "index",
      direction: "desc"
    };
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        sort
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.sort.field).toBe("index");
    expect(body.data.sort.direction).toBe("desc");
  });
  it("allows editing individual fields", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        permission: null
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.permission).toBe(null);
    expect(body.data.name).toBe(collection.name);
  });
  it("allows editing from non-private to private collection", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        permission: null,
        name: "Test"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toBe("Test");
    expect(body.data.permission).toBe(null); // ensure we return with a write level policy

    expect(body.policies.length).toBe(1);
    expect(body.policies[0].abilities.update).toBe(true);
  });
  it("allows editing from private to non-private collection", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      collectionId: collection.id,
      userId: user.id,
      createdById: user.id,
      permission: "read_write"
    });
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        permission: "read_write",
        name: "Test"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toBe("Test");
    expect(body.data.permission).toBe("read_write"); // ensure we return with a write level policy

    expect(body.policies.length).toBe(1);
    expect(body.policies[0].abilities.update).toBe(true);
  });
  it("allows editing by read-write collection user", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      collectionId: collection.id,
      userId: user.id,
      createdById: user.id,
      permission: "read_write"
    });
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        name: "Test"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toBe("Test");
    expect(body.policies.length).toBe(1);
  });
  it("allows editing by read-write collection group user", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    await group.addUser(user, {
      through: {
        createdById: user.id
      }
    });
    await collection.addGroup(group, {
      through: {
        permission: "read_write",
        createdById: user.id
      }
    });
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        name: "Test"
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.data.name).toBe("Test");
    expect(body.policies.length).toBe(1);
  });
  it("does not allow editing by read-only collection user", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    collection.permission = null;
    await collection.save();
    await _models.CollectionUser.create({
      collectionId: collection.id,
      userId: user.id,
      createdById: user.id,
      permission: "read"
    });
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        name: "Test"
      }
    });
    expect(res.status).toEqual(403);
  });
  it("does not allow setting unknown sort fields", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const sort = {
      field: "blah",
      direction: "desc"
    };
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        sort
      }
    });
    expect(res.status).toEqual(400);
  });
  it("does not allow setting unknown sort directions", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const sort = {
      field: "title",
      direction: "blah"
    };
    const res = await server.post("/api/collections.update", {
      body: {
        token: user.getJwtToken(),
        id: collection.id,
        sort
      }
    });
    expect(res.status).toEqual(400);
  });
});
describe("#collections.delete", () => {
  it("should require authentication", async () => {
    const res = await server.post("/api/collections.delete");
    const body = await res.json();
    expect(res.status).toEqual(401);
    expect(body).toMatchSnapshot();
  });
  it("should require authorization", async () => {
    const {
      collection
    } = await (0, _support.seed)();
    const user = await (0, _factories.buildUser)();
    const res = await server.post("/api/collections.delete", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(403);
  });
  it("should not allow deleting last collection", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)();
    const res = await server.post("/api/collections.delete", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    expect(res.status).toEqual(400);
  });
  it("should delete collection", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)(); // to ensure it isn't the last collection

    await (0, _factories.buildCollection)({
      teamId: user.teamId,
      createdById: user.id
    });
    const res = await server.post("/api/collections.delete", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.success).toBe(true);
  });
  it("should delete published documents", async () => {
    const {
      user,
      collection
    } = await (0, _support.seed)(); // to ensure it isn't the last collection

    await (0, _factories.buildCollection)({
      teamId: user.teamId,
      createdById: user.id
    }); // archived document should not be deleted

    await (0, _factories.buildDocument)({
      collectionId: collection.id,
      archivedAt: new Date()
    });
    const res = await server.post("/api/collections.delete", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.success).toBe(true);
    expect(await _models.Document.count({
      where: {
        collectionId: collection.id
      }
    })).toEqual(1);
  });
  it("allows deleting by read-write collection group user", async () => {
    const user = await (0, _factories.buildUser)();
    const collection = await (0, _factories.buildCollection)({
      permission: null,
      teamId: user.teamId
    });
    await (0, _factories.buildCollection)({
      teamId: user.teamId
    });
    const group = await (0, _factories.buildGroup)({
      teamId: user.teamId
    });
    await group.addUser(user, {
      through: {
        createdById: user.id
      }
    });
    await collection.addGroup(group, {
      through: {
        permission: "read_write",
        createdById: user.id
      }
    });
    const res = await server.post("/api/collections.delete", {
      body: {
        token: user.getJwtToken(),
        id: collection.id
      }
    });
    const body = await res.json();
    expect(res.status).toEqual(200);
    expect(body.success).toBe(true);
  });
});