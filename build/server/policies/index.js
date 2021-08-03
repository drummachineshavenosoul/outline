"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serialize = serialize;
exports.default = void 0;

var _models = require("../models");

var _policy = _interopRequireDefault(require("./policy"));

require("./apiKey");

require("./attachment");

require("./authenticationProvider");

require("./collection");

require("./document");

require("./integration");

require("./notificationSetting");

require("./share");

require("./user");

require("./team");

require("./group");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  can,
  abilities
} = _policy.default;

/*
 * Given a user and a model – output an object which describes the actions the
 * user may take against the model. This serialized policy is used for testing
 * and sent in API responses to allow clients to adjust which UI is displayed.
 */
function serialize(model, target) {
  let output = {};
  abilities.forEach(ability => {
    if (model instanceof ability.model && target instanceof ability.target) {
      let response = true;

      try {
        response = can(model, ability.action, target);
      } catch (err) {
        response = false;
      }

      output[ability.action] = response;
    }
  });
  return output;
}

var _default = _policy.default;
exports.default = _default;