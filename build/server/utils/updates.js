"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var _fetchWithProxy = _interopRequireDefault(require("fetch-with-proxy"));

var _invariant = _interopRequireDefault(require("invariant"));

var _package = _interopRequireDefault(require("../../package.json"));

var _models = require("../models");

var _redis = require("../redis");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const UPDATES_URL = "https://updates.getoutline.com";
const UPDATES_KEY = "UPDATES_KEY";

var _default = async () => {
  (0, _invariant.default)(process.env.SECRET_KEY && process.env.URL, "SECRET_KEY or URL env var is not set");
  const secret = process.env.SECRET_KEY.slice(0, 6) + process.env.URL;

  const id = _crypto.default.createHash("sha256").update(secret).digest("hex");

  const [userCount, teamCount, collectionCount, documentCount] = await Promise.all([_models.User.count(), _models.Team.count(), _models.Collection.count(), _models.Document.count()]);
  const body = JSON.stringify({
    id,
    version: 1,
    clientVersion: _package.default.version,
    analytics: {
      userCount,
      teamCount,
      collectionCount,
      documentCount
    }
  });
  await _redis.client.del(UPDATES_KEY);

  try {
    const response = await (0, _fetchWithProxy.default)(UPDATES_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body
    });
    const data = await response.json();

    if (data.severity) {
      await _redis.client.set(UPDATES_KEY, JSON.stringify({
        severity: data.severity,
        message: data.message,
        url: data.url
      }));
    }
  } catch (_e) {// no-op
  }
};

exports.default = _default;