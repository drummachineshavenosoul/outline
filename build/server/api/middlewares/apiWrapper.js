"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = apiWrapper;

var _stream = _interopRequireDefault(require("stream"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function apiWrapper() {
  return async function apiWrapperMiddleware(ctx, next) {
    await next();
    const ok = ctx.status < 400;

    if (typeof ctx.body !== "string" && !(ctx.body instanceof _stream.default.Readable)) {
      // $FlowFixMe
      ctx.body = { // $FlowFixMe
        ...ctx.body,
        status: ctx.status,
        ok
      };
    }
  };
}