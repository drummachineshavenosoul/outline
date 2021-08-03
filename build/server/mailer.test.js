"use strict";

var _mailer = _interopRequireDefault(require("./mailer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
describe("Mailer", () => {
  let fakeMailer = _mailer.default;
  let sendMailOutput;
  beforeEach(() => {
    process.env.URL = "http://localhost:3000";
    process.env.SMTP_FROM_EMAIL = "hello@example.com";
    jest.resetModules();
    fakeMailer.transporter = {
      sendMail: output => sendMailOutput = output
    };
  });
  test("#welcome", () => {
    fakeMailer.welcome({
      to: "user@example.com",
      teamUrl: "http://example.com"
    });
    expect(sendMailOutput).toMatchSnapshot();
  });
});