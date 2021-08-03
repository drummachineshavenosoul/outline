"use strict";

var _domains = require("./domains");

/* eslint-disable flowtype/require-valid-file-annotation */
// test suite is based on subset of parse-domain module we want to support
// https://github.com/peerigon/parse-domain/blob/master/test/parseDomain.test.js
describe("#parseDomain", function () {
  it("should remove the protocol", function () {
    expect((0, _domains.parseDomain)("http://example.com")).toMatchObject({
      subdomain: "",
      domain: "example",
      tld: "com"
    });
    expect((0, _domains.parseDomain)("//example.com")).toMatchObject({
      subdomain: "",
      domain: "example",
      tld: "com"
    });
    expect((0, _domains.parseDomain)("https://example.com")).toMatchObject({
      subdomain: "",
      domain: "example",
      tld: "com"
    });
  });
  it("should remove sub-domains", function () {
    expect((0, _domains.parseDomain)("www.example.com")).toMatchObject({
      subdomain: "www",
      domain: "example",
      tld: "com"
    });
  });
  it("should remove the path", function () {
    expect((0, _domains.parseDomain)("example.com/some/path?and&query")).toMatchObject({
      subdomain: "",
      domain: "example",
      tld: "com"
    });
    expect((0, _domains.parseDomain)("example.com/")).toMatchObject({
      subdomain: "",
      domain: "example",
      tld: "com"
    });
  });
  it("should remove the query string", function () {
    expect((0, _domains.parseDomain)("example.com?and&query")).toMatchObject({
      subdomain: "",
      domain: "example",
      tld: "com"
    });
  });
  it("should remove special characters", function () {
    expect((0, _domains.parseDomain)("http://m.example.com\r")).toMatchObject({
      subdomain: "m",
      domain: "example",
      tld: "com"
    });
  });
  it("should remove the port", function () {
    expect((0, _domains.parseDomain)("example.com:8080")).toMatchObject({
      subdomain: "",
      domain: "example",
      tld: "com"
    });
  });
  it("should allow @ characters in the path", function () {
    expect((0, _domains.parseDomain)("https://medium.com/@username/")).toMatchObject({
      subdomain: "",
      domain: "medium",
      tld: "com"
    });
  });
  it("should also work with three-level domains like .co.uk", function () {
    expect((0, _domains.parseDomain)("www.example.co.uk")).toMatchObject({
      subdomain: "www",
      domain: "example",
      tld: "co.uk"
    });
  });
  it("should not include private domains like blogspot.com by default", function () {
    expect((0, _domains.parseDomain)("foo.blogspot.com")).toMatchObject({
      subdomain: "foo",
      domain: "blogspot",
      tld: "com"
    });
  });
  it("should also work with the minimum", function () {
    expect((0, _domains.parseDomain)("example.com")).toMatchObject({
      subdomain: "",
      domain: "example",
      tld: "com"
    });
  });
  it("should return null if the given value is not a string", function () {
    expect((0, _domains.parseDomain)(undefined)).toBe(null);
    expect((0, _domains.parseDomain)({})).toBe(null);
    expect((0, _domains.parseDomain)("")).toBe(null);
  });
  it("should work with custom top-level domains (eg .local)", function () {
    expect((0, _domains.parseDomain)("mymachine.local")).toMatchObject({
      subdomain: "",
      domain: "mymachine",
      tld: "local"
    });
  });
});
describe("#stripSubdomain", function () {
  test("to work with localhost", function () {
    expect((0, _domains.stripSubdomain)("localhost")).toBe("localhost");
  });
  test("to return domains without a subdomain", function () {
    expect((0, _domains.stripSubdomain)("example")).toBe("example");
    expect((0, _domains.stripSubdomain)("example.com")).toBe("example.com");
    expect((0, _domains.stripSubdomain)("example.org:3000")).toBe("example.org");
  });
  test("to remove subdomains", function () {
    expect((0, _domains.stripSubdomain)("test.example.com")).toBe("example.com");
    expect((0, _domains.stripSubdomain)("test.example.com:3000")).toBe("example.com");
  });
});
describe("#isCustomSubdomain", function () {
  test("to work with localhost", function () {
    expect((0, _domains.isCustomSubdomain)("localhost")).toBe(false);
  });
  test("to return false for domains without a subdomain", function () {
    expect((0, _domains.isCustomSubdomain)("example")).toBe(false);
    expect((0, _domains.isCustomSubdomain)("example.com")).toBe(false);
    expect((0, _domains.isCustomSubdomain)("example.org:3000")).toBe(false);
  });
  test("to return false for www", function () {
    expect((0, _domains.isCustomSubdomain)("www.example.com")).toBe(false);
    expect((0, _domains.isCustomSubdomain)("www.example.com:3000")).toBe(false);
  });
  test("to return true for subdomains", function () {
    expect((0, _domains.isCustomSubdomain)("test.example.com")).toBe(true);
    expect((0, _domains.isCustomSubdomain)("test.example.com:3000")).toBe(true);
  });
});