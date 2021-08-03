"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomInteger = void 0;

var randomInteger = function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

exports.randomInteger = randomInteger;