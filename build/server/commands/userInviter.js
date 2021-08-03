"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userInviter;

var _lodash = require("lodash");

var _mailer = _interopRequireDefault(require("../mailer"));

var _models = require("../models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function userInviter({
  user,
  invites,
  ip
}) {
  const team = await _models.Team.findByPk(user.teamId); // filter out empties and obvious non-emails

  const compactedInvites = invites.filter(invite => !!invite.email.trim() && invite.email.match("@")); // normalize to lowercase and remove duplicates

  const normalizedInvites = (0, _lodash.uniqBy)(compactedInvites.map(invite => ({ ...invite,
    email: invite.email.toLowerCase()
  })), "email"); // filter out any existing users in the system

  const emails = normalizedInvites.map(invite => invite.email);
  const existingUsers = await _models.User.findAll({
    where: {
      teamId: user.teamId,
      email: emails
    }
  });
  const existingEmails = existingUsers.map(user => user.email);
  const filteredInvites = normalizedInvites.filter(invite => !existingEmails.includes(invite.email));
  let users = []; // send and record remaining invites

  for (const invite of filteredInvites) {
    const newUser = await _models.User.create({
      teamId: user.teamId,
      name: invite.name,
      email: invite.email,
      service: null
    });
    users.push(newUser);
    await _models.Event.create({
      name: "users.invite",
      actorId: user.id,
      teamId: user.teamId,
      data: {
        email: invite.email,
        name: invite.name
      },
      ip
    });
    await _mailer.default.invite({
      to: invite.email,
      name: invite.name,
      actorName: user.name,
      actorEmail: user.email,
      teamName: team.name,
      teamUrl: team.url
    });
  }

  return {
    sent: filteredInvites,
    users
  };
}