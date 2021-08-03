"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _util = _interopRequireDefault(require("util"));

var _koa = _interopRequireDefault(require("koa"));

var _koaRouter = _interopRequireDefault(require("koa-router"));

var _koaSendfile = _interopRequireDefault(require("koa-sendfile"));

var _koaStatic = _interopRequireDefault(require("koa-static"));

var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));

var _i18n = require("../shared/i18n");

var _env = _interopRequireDefault(require("./env"));

var _apexRedirect = _interopRequireDefault(require("./middlewares/apexRedirect"));

var _Share = _interopRequireDefault(require("./models/Share"));

var _opensearch = require("./utils/opensearch");

var _prefetchTags = _interopRequireDefault(require("./utils/prefetchTags"));

var _robots = require("./utils/robots");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const koa = new _koa.default();
const router = new _koaRouter.default();

const readFile = _util.default.promisify(_fs.default.readFile);

const readIndexFile = async ctx => {
  if (isProduction) {
    return readFile(_path.default.join(__dirname, "../app/index.html"));
  }

  if (isTest) {
    return readFile(_path.default.join(__dirname, "/static/index.html"));
  }

  const middleware = ctx.devMiddleware;
  await new Promise(resolve => middleware.waitUntilValid(resolve));
  return new Promise((resolve, reject) => {
    middleware.fileSystem.readFile(`${ctx.webpackConfig.output.path}/index.html`, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
};

const renderApp = async (ctx, next, title = "Outline") => {
  if (ctx.request.path === "/realtime/") {
    return next();
  }

  const page = await readIndexFile(ctx);
  const environment = `
    window.env = ${JSON.stringify(_env.default)};
  `;
  ctx.body = page.toString().replace(/\/\/inject-env\/\//g, environment).replace(/\/\/inject-title\/\//g, title).replace(/\/\/inject-prefetch\/\//g, _prefetchTags.default).replace(/\/\/inject-slack-app-id\/\//g, process.env.SLACK_APP_ID || "");
};

const renderShare = async (ctx, next) => {
  var _share, _share$document;

  const {
    shareId
  } = ctx.params; // Find the share record if publicly published so that the document title
  // can be be returned in the server-rendered HTML. This allows it to appear in
  // unfurls with more reliablity

  let share;

  if ((0, _isUUID.default)(shareId)) {
    share = await _Share.default.findOne({
      where: {
        id: shareId,
        published: true
      }
    });
  } // Allow shares to be embedded in iframes on other websites


  ctx.remove("X-Frame-Options");
  return renderApp(ctx, next, (_share = share) === null || _share === void 0 ? void 0 : (_share$document = _share.document) === null || _share$document === void 0 ? void 0 : _share$document.title);
}; // serve static assets


koa.use((0, _koaStatic.default)(_path.default.resolve(__dirname, "../../public"), {
  maxage: 60 * 60 * 24 * 30 * 1000
}));
router.get("/_health", ctx => ctx.body = "OK");

if (process.env.NODE_ENV === "production") {
  router.get("/static/*", async ctx => {
    ctx.set({
      "Service-Worker-Allowed": "/",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": `max-age=${356 * 24 * 60 * 60}`
    });
    await (0, _koaSendfile.default)(ctx, _path.default.join(__dirname, "../app/", ctx.path.substring(8)));
  });
}

router.get("/locales/:lng.json", async ctx => {
  let {
    lng
  } = ctx.params;

  if (!_i18n.languages.includes(lng)) {
    ctx.status = 404;
    return;
  }

  if (process.env.NODE_ENV === "production") {
    ctx.set({
      "Cache-Control": `max-age=${7 * 24 * 60 * 60}`
    });
  }

  await (0, _koaSendfile.default)(ctx, _path.default.join(__dirname, "../shared/i18n/locales", lng, "translation.json"));
});
router.get("/robots.txt", ctx => {
  ctx.body = (0, _robots.robotsResponse)(ctx);
});
router.get("/opensearch.xml", ctx => {
  ctx.type = "text/xml";
  ctx.body = (0, _opensearch.opensearchResponse)();
});
router.get("/share/:shareId", renderShare);
router.get("/share/:shareId/*", renderShare); // catch all for application

router.get("*", renderApp); // In order to report all possible performance metrics to Sentry this header
// must be provided when serving the application, see:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin

const timingOrigins = [_env.default.URL];

if (_env.default.SENTRY_DSN) {
  timingOrigins.push("https://sentry.io");
}

koa.use(async (ctx, next) => {
  ctx.set("Timing-Allow-Origin", timingOrigins.join(", "));
  await next();
});
koa.use((0, _apexRedirect.default)());
koa.use(router.routes());
var _default = koa;
exports.default = _default;