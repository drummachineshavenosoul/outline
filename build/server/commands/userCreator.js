"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userCreator;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _models = require("../models");

var _sequelize2 = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Op = _sequelize.default.Op;

async function userCreator({
  name,
  email,
  isAdmin,
  avatarUrl,
  teamId,
  authentication,
  ip
}) {
  const {
    authenticationProviderId,
    providerId,
    ...rest
  } = authentication;
  const auth = await _models.UserAuthentication.findOne({
    where: {
      providerId
    },
    include: [{
      model: _models.User,
      as: "user"
    }]
  }); // Someone has signed in with this authentication before, we just
  // want to update the details instead of creating a new record

  if (auth) {
    const {
      user
    } = auth; // We found an authentication record that matches the user id, but it's
    // associated with a different authentication provider, (eg a different
    // hosted google domain). This is possible in Google Auth when moving domains.
    // In the future we may auto-migrate these.

    if (auth.authenticationProviderId !== authenticationProviderId) {
      throw new Error(`User authentication ${providerId} already exists for ${auth.authenticationProviderId}, tried to assign to ${authenticationProviderId}`);
    }

    if (user) {
      await user.update({
        email
      });
      await auth.update(rest);
      return {
        user,
        authentication: auth,
        isNewUser: false
      };
    } // We found an authentication record, but the associated user was deleted or
    // otherwise didn't exist. Cleanup the auth record and proceed with creating
    // a new user. See: https://github.com/outline/outline/issues/2022


    await auth.destroy();
  } // A `user` record might exist in the form of an invite even if there is no
  // existing authentication record that matches. In Outline an invite is a
  // shell user record.


  const invite = await _models.User.findOne({
    where: {
      email,
      teamId,
      lastActiveAt: {
        [Op.eq]: null
      }
    },
    include: [{
      model: _models.UserAuthentication,
      as: "authentications",
      required: false
    }]
  }); // We have an existing invite for his user, so we need to update it with our
  // new details and link up the authentication method

  if (invite && !invite.authentications.length) {
    let transaction = await _sequelize2.sequelize.transaction();
    let auth;

    try {
      await invite.update({
        name,
        avatarUrl
      }, {
        transaction
      });
      auth = await invite.createAuthentication(authentication, {
        transaction
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    return {
      user: invite,
      authentication: auth,
      isNewUser: true
    };
  } // No auth, no user – this is an entirely new sign in.


  let transaction = await _sequelize2.sequelize.transaction();

  try {
    const user = await _models.User.create({
      name,
      email,
      isAdmin,
      teamId,
      avatarUrl,
      service: null,
      authentications: [authentication]
    }, {
      include: "authentications",
      transaction
    });
    await _models.Event.create({
      name: "users.create",
      actorId: user.id,
      userId: user.id,
      teamId: user.teamId,
      data: {
        name: user.name
      },
      ip
    }, {
      transaction
    });
    await transaction.commit();
    return {
      user,
      authentication: user.authentications[0],
      isNewUser: true
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}