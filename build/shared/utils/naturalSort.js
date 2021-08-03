"use strict";

require("core-js/modules/es.array.sort");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _deburr2 = _interopRequireDefault(require("lodash/deburr"));

var _naturalSort = _interopRequireDefault(require("natural-sort"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sorter = (0, _naturalSort.default)();

function getSortByField(item, keyOrCallback) {
  if (typeof keyOrCallback === "string") {
    return (0, _deburr2.default)(item[keyOrCallback]);
  }

  return keyOrCallback(item);
}

function naturalSortBy(items, key, sortOptions) {
  if (!items) return [];
  var sort = sortOptions ? (0, _naturalSort.default)(sortOptions) : sorter;
  return items.sort(function (a, b) {
    return sort(getSortByField(a, key), getSortByField(b, key));
  });
}

var _default = naturalSortBy;
exports.default = _default;