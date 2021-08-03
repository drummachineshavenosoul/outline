"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.includes");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.exec");

require("core-js/modules/es.string.ends-with");

require("core-js/modules/es.string.includes");

require("core-js/modules/es.string.replace");

require("core-js/modules/es.string.split");

require("core-js/modules/es.string.starts-with");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseOutlineExport = parseOutlineExport;

require("regenerator-runtime/runtime");

var _path = _interopRequireDefault(require("path"));

var _jszip = _interopRequireWildcard(require("jszip"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function parseOutlineExport(_x) {
  return _parseOutlineExport.apply(this, arguments);
}

function _parseOutlineExport() {
  _parseOutlineExport = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(input) {
    var zip, items;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _jszip.default.loadAsync(input);

          case 2:
            zip = _context2.sent;
            // this is so we can use async / await a little easier
            items = [];
            zip.forEach( /*#__PURE__*/function () {
              var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(rawPath, item) {
                var itemPath, dir, name, depth, metadata, type;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        itemPath = rawPath.replace(/\/$/, "");
                        dir = _path.default.dirname(itemPath);
                        name = _path.default.basename(item.name);
                        depth = itemPath.split("/").length - 1; // known skippable items

                        if (!(itemPath.startsWith("__MACOSX") || itemPath.endsWith(".DS_Store"))) {
                          _context.next = 6;
                          break;
                        }

                        return _context.abrupt("return");

                      case 6:
                        // attempt to parse extra metadata from zip comment
                        metadata = {};

                        try {
                          metadata = item.comment ? JSON.parse(item.comment) : {};
                        } catch (err) {
                          console.log("ZIP comment found for ".concat(item.name, ", but could not be parsed as metadata: ").concat(item.comment));
                        }

                        if (!(depth === 0 && !item.dir)) {
                          _context.next = 10;
                          break;
                        }

                        throw new Error("Root of zip file must only contain folders representing collections");

                      case 10:
                        if (depth === 0 && item.dir && name) {
                          type = "collection";
                        }

                        if (depth > 0 && !item.dir && item.name.endsWith(".md")) {
                          type = "document";
                        }

                        if (depth > 0 && !item.dir && itemPath.includes("uploads")) {
                          type = "attachment";
                        }

                        if (type) {
                          _context.next = 15;
                          break;
                        }

                        return _context.abrupt("return");

                      case 15:
                        items.push({
                          path: itemPath,
                          dir: dir,
                          name: name,
                          depth: depth,
                          type: type,
                          metadata: metadata,
                          item: item
                        });

                      case 16:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x2, _x3) {
                return _ref.apply(this, arguments);
              };
            }());
            return _context2.abrupt("return", items);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _parseOutlineExport.apply(this, arguments);
}