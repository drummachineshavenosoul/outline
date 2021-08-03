"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dateFns = require("date-fns");

var _debug = _interopRequireDefault(require("debug"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _documentPermanentDeleter = require("../commands/documentPermanentDeleter");

var _errors = require("../errors");

var _models = require("../models");

var _sequelize = require("../sequelize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = new _koaRouter.default();
const log = (0, _debug.default)("utils");
router.post("utils.gc", async ctx => {
  const {
    token,
    limit = 500
  } = ctx.body;

  if (process.env.UTILS_SECRET !== token) {
    throw new _errors.AuthenticationError("Invalid secret token");
  }

  log(`Permanently destroying upto ${limit} documents older than 30 days…`);
  const documents = await _models.Document.scope("withUnpublished").findAll({
    attributes: ["id", "teamId", "text", "deletedAt"],
    where: {
      deletedAt: {
        [_sequelize.Op.lt]: (0, _dateFns.subDays)(new Date(), 30)
      }
    },
    paranoid: false,
    limit
  });
  const countDeletedDocument = await (0, _documentPermanentDeleter.documentPermanentDeleter)(documents);
  log(`Destroyed ${countDeletedDocument} documents`);
  ctx.body = {
    success: true
  };
});
var _default = router;
exports.default = _default;