"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StateStore = void 0;

var _dateFns = require("date-fns");

var _errors = require("../errors");

var _domains = require("./domains");

class StateStore {
  constructor() {
    this.key = "state";

    this.store = (req, callback) => {
      const state = Math.random().toString(36).substring(7); // $FlowFixMe

      req.cookies.set(this.key, state, {
        httpOnly: false,
        expires: (0, _dateFns.addMinutes)(new Date(), 10),
        domain: (0, _domains.getCookieDomain)(req.hostname)
      });
      callback(null, state);
    };

    this.verify = (req, providedState, callback) => {
      // $FlowFixMe
      const state = req.cookies.get(this.key);

      if (!state) {
        return callback(new _errors.OAuthStateMismatchError("State not return in OAuth flow"));
      } // $FlowFixMe


      req.cookies.set(this.key, "", {
        httpOnly: false,
        expires: (0, _dateFns.subMinutes)(new Date(), 1),
        domain: (0, _domains.getCookieDomain)(req.hostname)
      });

      if (state !== providedState) {
        return callback(new _errors.OAuthStateMismatchError());
      }

      callback(null, true);
    };
  }

}

exports.StateStore = StateStore;