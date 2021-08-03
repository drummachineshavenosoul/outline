"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _koa = _interopRequireDefault(require("koa"));

var _koaBody = _interopRequireDefault(require("koa-body"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _errors = require("../errors");

var _errorHandling = _interopRequireDefault(require("../middlewares/errorHandling"));

var _methodOverride = _interopRequireDefault(require("../middlewares/methodOverride"));

var _validation = _interopRequireDefault(require("../middlewares/validation"));

var _apiKeys = _interopRequireDefault(require("./apiKeys"));

var _attachments = _interopRequireDefault(require("./attachments"));

var _auth = _interopRequireDefault(require("./auth"));

var _authenticationProviders = _interopRequireDefault(require("./authenticationProviders"));

var _collections = _interopRequireDefault(require("./collections"));

var _documents = _interopRequireDefault(require("./documents"));

var _events = _interopRequireDefault(require("./events"));

var _groups = _interopRequireDefault(require("./groups"));

var _hooks = _interopRequireDefault(require("./hooks"));

var _integrations = _interopRequireDefault(require("./integrations"));

var _apiWrapper = _interopRequireDefault(require("./middlewares/apiWrapper"));

var _editor = _interopRequireDefault(require("./middlewares/editor"));

var _notificationSettings = _interopRequireDefault(require("./notificationSettings"));

var _revisions = _interopRequireDefault(require("./revisions"));

var _shares = _interopRequireDefault(require("./shares"));

var _team = _interopRequireDefault(require("./team"));

var _users = _interopRequireDefault(require("./users"));

var _utils = _interopRequireDefault(require("./utils"));

var _views = _interopRequireDefault(require("./views"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const api = new _koa.default();
const router = new _koaRouter.default(); // middlewares

api.use((0, _errorHandling.default)());
api.use((0, _koaBody.default)({
  multipart: true,
  formidable: {
    maxFieldsSize: 10 * 1024 * 1024
  }
}));
api.use((0, _methodOverride.default)());
api.use((0, _validation.default)());
api.use((0, _apiWrapper.default)());
api.use((0, _editor.default)()); // routes

router.use("/", _auth.default.routes());
router.use("/", _authenticationProviders.default.routes());
router.use("/", _events.default.routes());
router.use("/", _users.default.routes());
router.use("/", _collections.default.routes());
router.use("/", _documents.default.routes());
router.use("/", _revisions.default.routes());
router.use("/", _views.default.routes());
router.use("/", _hooks.default.routes());
router.use("/", _apiKeys.default.routes());
router.use("/", _shares.default.routes());
router.use("/", _team.default.routes());
router.use("/", _integrations.default.routes());
router.use("/", _notificationSettings.default.routes());
router.use("/", _attachments.default.routes());
router.use("/", _utils.default.routes());
router.use("/", _groups.default.routes());
router.post("*", ctx => {
  ctx.throw(new _errors.NotFoundError("Endpoint not found"));
}); // Router is embedded in a Koa application wrapper, because koa-router does not
// allow middleware to catch any routes which were not explicitly defined.

api.use(router.routes());
var _default = api;
exports.default = _default;