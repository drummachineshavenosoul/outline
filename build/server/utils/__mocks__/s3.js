"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.publicS3Endpoint = exports.uploadToS3FromBuffer = void 0;

/* eslint-disable flowtype/require-valid-file-annotation */
const uploadToS3FromBuffer = jest.fn().mockReturnValue("/endpoint/key");
exports.uploadToS3FromBuffer = uploadToS3FromBuffer;
const publicS3Endpoint = jest.fn().mockReturnValue("http://mock");
exports.publicS3Endpoint = publicS3Endpoint;