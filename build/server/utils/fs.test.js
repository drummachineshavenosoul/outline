"use strict";

var _fs = require("./fs");

describe("serializeFilename", () => {
  it("should serialize forward slashes", () => {
    expect((0, _fs.serializeFilename)(`/`)).toBe("%2F");
    expect((0, _fs.serializeFilename)(`this / and / this`)).toBe("this %2F and %2F this");
  });
  it("should serialize back slashes", () => {
    expect((0, _fs.serializeFilename)(`\\`)).toBe("%5C");
    expect((0, _fs.serializeFilename)(`this \\ and \\ this`)).toBe("this %5C and %5C this");
  });
});
describe("deserializeFilename", () => {
  it("should deserialize forward slashes", () => {
    expect((0, _fs.deserializeFilename)("%2F")).toBe("/");
    expect((0, _fs.deserializeFilename)("this %2F and %2F this")).toBe(`this / and / this`);
  });
  it("should deserialize back slashes", () => {
    expect((0, _fs.deserializeFilename)("%5C")).toBe(`\\`);
    expect((0, _fs.deserializeFilename)("this %5C and %5C this")).toBe(`this \\ and \\ this`);
  });
});