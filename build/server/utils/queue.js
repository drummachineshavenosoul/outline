"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createQueue = createQueue;

var _bull = _interopRequireDefault(require("bull"));

var _ioredis = _interopRequireDefault(require("ioredis"));

var _redis = require("../redis");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createQueue(name) {
  return new _bull.default(name, {
    createClient(type) {
      switch (type) {
        case "client":
          return _redis.client;

        case "subscriber":
          return _redis.subscriber;

        default:
          return new _ioredis.default(process.env.REDIS_URL);
      }
    }

  });
}