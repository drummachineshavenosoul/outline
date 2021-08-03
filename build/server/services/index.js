"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _debug = _interopRequireDefault(require("debug"));

var _fs = require("../utils/fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug.default)("services");
const services = {};

if (!process.env.SINGLE_RUN) {
  (0, _fs.requireDirectory)(__dirname).forEach(([module, name]) => {
    if (module && module.default) {
      const Service = module.default;
      services[name] = new Service();
      log(`loaded ${name} service`);
    }
  });
}

var _default = services;
exports.default = _default;