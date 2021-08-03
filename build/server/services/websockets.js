"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dateFns = require("date-fns");

var _main = require("../main");

var _models = require("../models");

var _sequelize = require("../sequelize");

class Websockets {
  async on(event) {
    if (!_main.socketio) {
      return;
    }

    switch (event.name) {
      case "documents.publish":
      case "documents.restore":
      case "documents.archive":
      case "documents.unarchive":
        {
          const document = await _models.Document.findByPk(event.documentId, {
            paranoid: false
          });
          const channel = document.publishedAt ? `collection-${document.collectionId}` : `user-${event.actorId}`;
          return _main.socketio.to(channel).emit("entities", {
            event: event.name,
            documentIds: [{
              id: document.id,
              updatedAt: document.updatedAt
            }],
            collectionIds: [{
              id: document.collectionId
            }]
          });
        }

      case "documents.delete":
        {
          const document = await _models.Document.findByPk(event.documentId, {
            paranoid: false
          });

          if (!document.publishedAt) {
            return _main.socketio.to(`user-${document.createdById}`).emit("entities", {
              event: event.name,
              documentIds: [{
                id: document.id,
                updatedAt: document.updatedAt
              }]
            });
          }

          return _main.socketio.to(`collection-${document.collectionId}`).emit("entities", {
            event: event.name,
            documentIds: [{
              id: document.id,
              updatedAt: document.updatedAt
            }],
            collectionIds: [{
              id: document.collectionId
            }]
          });
        }

      case "documents.permanent_delete":
        {
          return _main.socketio.to(`collection-${event.collectionId}`).emit(event.name, {
            documentId: event.documentId
          });
        }

      case "documents.pin":
      case "documents.unpin":
      case "documents.update":
        {
          const document = await _models.Document.findByPk(event.documentId, {
            paranoid: false
          });
          const channel = document.publishedAt ? `collection-${document.collectionId}` : `user-${event.actorId}`;
          return _main.socketio.to(channel).emit("entities", {
            event: event.name,
            documentIds: [{
              id: document.id,
              updatedAt: document.updatedAt
            }]
          });
        }

      case "documents.create":
        {
          const document = await _models.Document.findByPk(event.documentId);
          return _main.socketio.to(`user-${event.actorId}`).emit("entities", {
            event: event.name,
            documentIds: [{
              id: document.id,
              updatedAt: document.updatedAt
            }],
            collectionIds: [{
              id: document.collectionId
            }]
          });
        }

      case "documents.star":
      case "documents.unstar":
        {
          return _main.socketio.to(`user-${event.actorId}`).emit(event.name, {
            documentId: event.documentId
          });
        }

      case "documents.move":
        {
          const documents = await _models.Document.findAll({
            where: {
              id: event.data.documentIds
            },
            paranoid: false
          });
          documents.forEach(document => {
            _main.socketio.to(`collection-${document.collectionId}`).emit("entities", {
              event: event.name,
              documentIds: [{
                id: document.id,
                updatedAt: document.updatedAt
              }]
            });
          });
          event.data.collectionIds.forEach(collectionId => {
            _main.socketio.to(`collection-${collectionId}`).emit("entities", {
              event: event.name,
              collectionIds: [{
                id: collectionId
              }]
            });
          });
          return;
        }

      case "collections.create":
        {
          const collection = await _models.Collection.findByPk(event.collectionId, {
            paranoid: false
          });

          _main.socketio.to(collection.permission ? `team-${collection.teamId}` : `collection-${collection.id}`).emit("entities", {
            event: event.name,
            collectionIds: [{
              id: collection.id,
              updatedAt: collection.updatedAt
            }]
          });

          return _main.socketio.to(collection.permission ? `team-${collection.teamId}` : `collection-${collection.id}`).emit("join", {
            event: event.name,
            collectionId: collection.id
          });
        }

      case "collections.update":
      case "collections.delete":
        {
          const collection = await _models.Collection.findByPk(event.collectionId, {
            paranoid: false
          });
          return _main.socketio.to(`team-${collection.teamId}`).emit("entities", {
            event: event.name,
            collectionIds: [{
              id: collection.id,
              updatedAt: collection.updatedAt
            }]
          });
        }

      case "collections.move":
        {
          return _main.socketio.to(`collection-${event.collectionId}`).emit("collections.update_index", {
            collectionId: event.collectionId,
            index: event.data.index
          });
        }

      case "collections.add_user":
        {
          // the user being added isn't yet in the websocket channel for the collection
          // so they need to be notified separately
          _main.socketio.to(`user-${event.userId}`).emit(event.name, {
            event: event.name,
            userId: event.userId,
            collectionId: event.collectionId
          }); // let everyone with access to the collection know a user was added


          _main.socketio.to(`collection-${event.collectionId}`).emit(event.name, {
            event: event.name,
            userId: event.userId,
            collectionId: event.collectionId
          }); // tell any user clients to connect to the websocket channel for the collection


          return _main.socketio.to(`user-${event.userId}`).emit("join", {
            event: event.name,
            collectionId: event.collectionId
          });
        }

      case "collections.remove_user":
        {
          const membershipUserIds = await _models.Collection.membershipUserIds(event.collectionId);

          if (membershipUserIds.includes(event.userId)) {
            // Even though we just removed a user from the collection
            // the user still has access through some means
            // treat this like an add, so that the client re-syncs policies
            _main.socketio.to(`user-${event.userId}`).emit("collections.add_user", {
              event: "collections.add_user",
              userId: event.userId,
              collectionId: event.collectionId
            });
          } else {
            // let everyone with access to the collection know a user was removed
            _main.socketio.to(`collection-${event.collectionId}`).emit("collections.remove_user", {
              event: event.name,
              userId: event.userId,
              collectionId: event.collectionId
            }); // tell any user clients to disconnect from the websocket channel for the collection


            _main.socketio.to(`user-${event.userId}`).emit("leave", {
              event: event.name,
              collectionId: event.collectionId
            });
          }

          return;
        }

      case "collections.add_group":
        {
          const group = await _models.Group.findByPk(event.data.groupId); // the users being added are not yet in the websocket channel for the collection
          // so they need to be notified separately

          for (const groupMembership of group.groupMemberships) {
            _main.socketio.to(`user-${groupMembership.userId}`).emit("collections.add_user", {
              event: event.name,
              userId: groupMembership.userId,
              collectionId: event.collectionId
            }); // tell any user clients to connect to the websocket channel for the collection


            _main.socketio.to(`user-${groupMembership.userId}`).emit("join", {
              event: event.name,
              collectionId: event.collectionId
            });
          }

          return;
        }

      case "collections.remove_group":
        {
          const group = await _models.Group.findByPk(event.data.groupId);
          const membershipUserIds = await _models.Collection.membershipUserIds(event.collectionId);

          for (const groupMembership of group.groupMemberships) {
            if (membershipUserIds.includes(groupMembership.userId)) {
              // the user still has access through some means...
              // treat this like an add, so that the client re-syncs policies
              _main.socketio.to(`user-${groupMembership.userId}`).emit("collections.add_user", {
                event: event.name,
                userId: groupMembership.userId,
                collectionId: event.collectionId
              });
            } else {
              // let users in the channel know they were removed
              _main.socketio.to(`user-${groupMembership.userId}`).emit("collections.remove_user", {
                event: event.name,
                userId: groupMembership.userId,
                collectionId: event.collectionId
              }); // tell any user clients to disconnect to the websocket channel for the collection


              _main.socketio.to(`user-${groupMembership.userId}`).emit("leave", {
                event: event.name,
                collectionId: event.collectionId
              });
            }
          }

          return;
        }

      case "groups.create":
      case "groups.update":
        {
          const group = await _models.Group.findByPk(event.modelId, {
            paranoid: false
          });
          return _main.socketio.to(`team-${group.teamId}`).emit("entities", {
            event: event.name,
            groupIds: [{
              id: group.id,
              updatedAt: group.updatedAt
            }]
          });
        }

      case "groups.add_user":
        {
          // do an add user for every collection that the group is a part of
          const collectionGroupMemberships = await _models.CollectionGroup.findAll({
            where: {
              groupId: event.modelId
            }
          });

          for (const collectionGroup of collectionGroupMemberships) {
            // the user being added isn't yet in the websocket channel for the collection
            // so they need to be notified separately
            _main.socketio.to(`user-${event.userId}`).emit("collections.add_user", {
              event: event.name,
              userId: event.userId,
              collectionId: collectionGroup.collectionId
            }); // let everyone with access to the collection know a user was added


            _main.socketio.to(`collection-${collectionGroup.collectionId}`).emit("collections.add_user", {
              event: event.name,
              userId: event.userId,
              collectionId: collectionGroup.collectionId
            }); // tell any user clients to connect to the websocket channel for the collection


            return _main.socketio.to(`user-${event.userId}`).emit("join", {
              event: event.name,
              collectionId: collectionGroup.collectionId
            });
          }

          return;
        }

      case "groups.remove_user":
        {
          const collectionGroupMemberships = await _models.CollectionGroup.findAll({
            where: {
              groupId: event.modelId
            }
          });

          for (const collectionGroup of collectionGroupMemberships) {
            // if the user has any memberships remaining on the collection
            // we need to emit add instead of remove
            const collection = await _models.Collection.scope({
              method: ["withMembership", event.userId]
            }).findByPk(collectionGroup.collectionId);

            if (!collection) {
              continue;
            }

            const hasMemberships = collection.memberships.length > 0 || collection.collectionGroupMemberships.length > 0;

            if (hasMemberships) {
              // the user still has access through some means...
              // treat this like an add, so that the client re-syncs policies
              _main.socketio.to(`user-${event.userId}`).emit("collections.add_user", {
                event: event.name,
                userId: event.userId,
                collectionId: collectionGroup.collectionId
              });
            } else {
              // let everyone with access to the collection know a user was removed
              _main.socketio.to(`collection-${collectionGroup.collectionId}`).emit("collections.remove_user", {
                event: event.name,
                userId: event.userId,
                collectionId: collectionGroup.collectionId
              }); // tell any user clients to disconnect from the websocket channel for the collection


              _main.socketio.to(`user-${event.userId}`).emit("leave", {
                event: event.name,
                collectionId: collectionGroup.collectionId
              });
            }
          }

          return;
        }

      case "groups.delete":
        {
          const group = await _models.Group.findByPk(event.modelId, {
            paranoid: false
          });

          _main.socketio.to(`team-${group.teamId}`).emit("entities", {
            event: event.name,
            groupIds: [{
              id: group.id,
              updatedAt: group.updatedAt
            }]
          }); // we the users and collection relations that were just severed as a result of the group deletion
          // since there are cascading deletes, we approximate this by looking for the recently deleted
          // items in the GroupUser and CollectionGroup tables


          const groupUsers = await _models.GroupUser.findAll({
            paranoid: false,
            where: {
              groupId: event.modelId,
              deletedAt: {
                [_sequelize.Op.gt]: (0, _dateFns.subHours)(new Date(), 1)
              }
            }
          });
          const collectionGroupMemberships = await _models.CollectionGroup.findAll({
            paranoid: false,
            where: {
              groupId: event.modelId,
              deletedAt: {
                [_sequelize.Op.gt]: (0, _dateFns.subHours)(new Date(), 1)
              }
            }
          });

          for (const collectionGroup of collectionGroupMemberships) {
            const membershipUserIds = await _models.Collection.membershipUserIds(collectionGroup.collectionId);

            for (const groupUser of groupUsers) {
              if (membershipUserIds.includes(groupUser.userId)) {
                // the user still has access through some means...
                // treat this like an add, so that the client re-syncs policies
                _main.socketio.to(`user-${groupUser.userId}`).emit("collections.add_user", {
                  event: event.name,
                  userId: groupUser.userId,
                  collectionId: collectionGroup.collectionId
                });
              } else {
                // let everyone with access to the collection know a user was removed
                _main.socketio.to(`collection-${collectionGroup.collectionId}`).emit("collections.remove_user", {
                  event: event.name,
                  userId: groupUser.userId,
                  collectionId: collectionGroup.collectionId
                }); // tell any user clients to disconnect from the websocket channel for the collection


                _main.socketio.to(`user-${groupUser.userId}`).emit("leave", {
                  event: event.name,
                  collectionId: collectionGroup.collectionId
                });
              }
            }
          }

          return;
        }

      default:
    }
  }

}

exports.default = Websockets;