"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.robotsResponse = void 0;
const DISALLOW_ROBOTS = `User-agent: *
Disallow: /`;

const robotsResponse = ctx => {
  if (ctx.headers.host.indexOf("getoutline.com") < 0) return DISALLOW_ROBOTS;
};

exports.robotsResponse = robotsResponse;