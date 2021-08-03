"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gauge = gauge;
exports.gaugePerInstance = gaugePerInstance;
exports.increment = increment;

var _datadogMetrics = _interopRequireDefault(require("datadog-metrics"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (process.env.DD_API_KEY) {
  _datadogMetrics.default.init({
    apiKey: process.env.DD_API_KEY,
    prefix: "outline.",
    defaultTags: [`env:${process.env.DD_ENV || process.env.NODE_ENV}`]
  });
}

function gauge(key, value, tags) {
  if (!process.env.DD_API_KEY) {
    return;
  }

  return _datadogMetrics.default.gauge(key, value, tags);
}

function gaugePerInstance(key, value, tags = []) {
  if (!process.env.DD_API_KEY) {
    return;
  }

  const instanceId = process.env.INSTANCE_ID || process.env.HEROKU_DYNO_ID;

  if (!instanceId) {
    throw new Error("INSTANCE_ID or HEROKU_DYNO_ID must be set when using Datadog");
  }

  return _datadogMetrics.default.gauge(key, value, [...tags, `instance:${instanceId}`]);
}

function increment(key, tags) {
  if (!process.env.DD_API_KEY) {
    return;
  }

  return _datadogMetrics.default.increment(key, tags);
}