"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = auth;

var _errors = require("../errors");

var _models = require("../models");

var _jwt = require("../utils/jwt");

function auth(options = {}) {
  return async function authMiddleware(ctx, next) {
    let token;
    const authorizationHeader = ctx.request.get("authorization");

    if (authorizationHeader) {
      const parts = authorizationHeader.split(" ");

      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        throw new _errors.AuthenticationError(`Bad Authorization header format. Format is "Authorization: Bearer <token>"`);
      }
    } else if (ctx.body && ctx.body.token) {
      token = ctx.body.token;
    } else if (ctx.request.query.token) {
      token = ctx.request.query.token;
    } else {
      token = ctx.cookies.get("accessToken");
    }

    if (!token && options.required !== false) {
      throw new _errors.AuthenticationError("Authentication required");
    }

    let user;

    if (token) {
      if (String(token).match(/^[\w]{38}$/)) {
        ctx.state.authType = "api";
        let apiKey;

        try {
          apiKey = await _models.ApiKey.findOne({
            where: {
              secret: token
            }
          });
        } catch (err) {
          throw new _errors.AuthenticationError("Invalid API key");
        }

        if (!apiKey) {
          throw new _errors.AuthenticationError("Invalid API key");
        }

        user = await _models.User.findByPk(apiKey.userId, {
          include: [{
            model: _models.Team,
            as: "team",
            required: true
          }]
        });

        if (!user) {
          throw new _errors.AuthenticationError("Invalid API key");
        }
      } else {
        ctx.state.authType = "app";
        user = await (0, _jwt.getUserForJWT)(String(token));
      }

      if (user.isSuspended) {
        const suspendingAdmin = await _models.User.findOne({
          where: {
            id: user.suspendedById
          },
          paranoid: false
        });
        throw new _errors.UserSuspendedError({
          adminEmail: suspendingAdmin.email
        });
      } // not awaiting the promise here so that the request is not blocked


      user.updateActiveAt(ctx.request.ip);
      ctx.state.token = String(token);
      ctx.state.user = user;
    }

    return next();
  };
}