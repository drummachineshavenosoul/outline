"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koa = _interopRequireDefault(require("koa"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _errors = require("../errors");

var _mailer = require("../mailer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const emailPreviews = new _koa.default();
const router = new _koaRouter.default();
router.get("/:type/:format", async ctx => {
  let mailerOutput;
  let mailer = new _mailer.Mailer();
  mailer.transporter = {
    sendMail: data => mailerOutput = data
  };

  switch (ctx.params.type) {
    // case 'emailWithProperties':
    //   mailer.emailWithProperties('user@example.com', {...properties});
    //   break;
    default:
      if (Object.getOwnPropertyNames(mailer).includes(ctx.params.type)) {
        // $FlowIssue flow doesn't like this but we're ok with it
        mailer[ctx.params.type]("user@example.com");
      } else throw new _errors.NotFoundError("Email template could not be found");

  }

  if (!mailerOutput) return;

  if (ctx.params.format === "text") {
    ctx.body = mailerOutput.text;
  } else {
    ctx.body = mailerOutput.html;
  }
});
emailPreviews.use(router.routes());
var _default = emailPreviews;
exports.default = _default;