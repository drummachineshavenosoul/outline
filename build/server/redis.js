"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscriber = exports.client = void 0;

var _ioredis = _interopRequireDefault(require("ioredis"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const options = {
  maxRetriesPerRequest: 20,

  retryStrategy(times) {
    console.warn(`Retrying redis connection: attempt ${times}`);
    return Math.min(times * 100, 3000);
  }

};
const client = new _ioredis.default(process.env.REDIS_URL, options);
exports.client = client;
const subscriber = new _ioredis.default(process.env.REDIS_URL, options); // More than the default of 10 listeners is expected for the amount of queues
// we're running. Increase the max here to prevent a warning in the console:
// https://github.com/OptimalBits/bull/issues/1192

exports.subscriber = subscriber;
client.setMaxListeners(100);
subscriber.setMaxListeners(100);