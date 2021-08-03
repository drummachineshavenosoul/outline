"use strict";

var _i18next = _interopRequireDefault(require("i18next"));

var _translation = _interopRequireDefault(require("./locales/de_DE/translation.json"));

var _translation2 = _interopRequireDefault(require("./locales/en_US/translation.json"));

var _translation3 = _interopRequireDefault(require("./locales/pt_PT/translation.json"));

var _ = require(".");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
describe("i18n process.env is unset", function () {
  beforeEach(function () {
    delete process.env.DEFAULT_LANGUAGE;
    (0, _.initI18n)().addResources("en-US", "translation", _translation2.default).addResources("de-DE", "translation", _translation.default).addResources("pt-PT", "translation", _translation3.default);
  });
  it("translation of key should match", function () {
    return expect(_i18next.default.t("Saving")).toBe("Saving");
  });
  it("translation if changed to de-DE", function () {
    _i18next.default.changeLanguage("de-DE");

    expect(_i18next.default.t("Saving")).toBe("Speichert");
  });
  it("translation if changed to pt-PT", function () {
    _i18next.default.changeLanguage("pt-PT");

    expect(_i18next.default.t("Saving")).toBe("A guardar");
  });
});
describe("i18n process.env is en-US", function () {
  beforeEach(function () {
    process.env.DEFAULT_LANGUAGE = "en-US";
    (0, _.initI18n)().addResources("en-US", "translation", _translation2.default).addResources("de-DE", "translation", _translation.default).addResources("pt-PT", "translation", _translation3.default);
  });
  it("translation of key should match", function () {
    return expect(_i18next.default.t("Saving")).toBe("Saving");
  });
  it("translation if changed to de-DE", function () {
    _i18next.default.changeLanguage("de-DE");

    expect(_i18next.default.t("Saving")).toBe("Speichert");
  });
  it("translation if changed to pt-PT", function () {
    _i18next.default.changeLanguage("pt-PT");

    expect(_i18next.default.t("Saving")).toBe("A guardar");
  });
});
describe("i18n process.env is de-DE", function () {
  beforeEach(function () {
    process.env.DEFAULT_LANGUAGE = "de-DE";
    (0, _.initI18n)().addResources("en-US", "translation", _translation2.default).addResources("de-DE", "translation", _translation.default).addResources("pt-PT", "translation", _translation3.default);
  });
  it("translation of key should match", function () {
    return expect(_i18next.default.t("Saving")).toBe("Speichert");
  });
  it("translation if changed to en-US", function () {
    _i18next.default.changeLanguage("en-US");

    expect(_i18next.default.t("Saving")).toBe("Saving");
  });
  it("translation if changed to pt-PT", function () {
    _i18next.default.changeLanguage("pt-PT");

    expect(_i18next.default.t("Saving")).toBe("A guardar");
  });
});
describe("i18n process.env is pt-PT", function () {
  beforeEach(function () {
    process.env.DEFAULT_LANGUAGE = "pt-PT";
    (0, _.initI18n)().addResources("en-US", "translation", _translation2.default).addResources("de-DE", "translation", _translation.default).addResources("pt-PT", "translation", _translation3.default);
  });
  it("translation of key should match", function () {
    return expect(_i18next.default.t("Saving")).toBe("A guardar");
  });
  it("translation if changed to en-US", function () {
    _i18next.default.changeLanguage("en-US");

    expect(_i18next.default.t("Saving")).toBe("Saving");
  });
  it("translation if changed to de-DE", function () {
    _i18next.default.changeLanguage("de-DE");

    expect(_i18next.default.t("Saving")).toBe("Speichert");
  });
});