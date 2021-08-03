"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = methodOverride;

var _queryString = _interopRequireDefault(require("query-string"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function methodOverride() {
  return async function methodOverrideMiddleware(ctx, next) {
    if (ctx.method === "POST") {
      // $FlowFixMe
      ctx.body = ctx.request.body;
    } else if (ctx.method === "GET") {
      ctx.method = 'POST'; // eslint-disable-line

      ctx.body = _queryString.default.parse(ctx.querystring);
    }

    return next();
  };
}