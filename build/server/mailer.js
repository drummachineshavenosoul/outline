"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendEmail = exports.mailerQueue = exports.default = exports.Mailer = void 0;

var Sentry = _interopRequireWildcard(require("@sentry/node"));

var _debug = _interopRequireDefault(require("debug"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _oyVey = _interopRequireDefault(require("oy-vey"));

var React = _interopRequireWildcard(require("react"));

var _CollectionNotificationEmail = require("./emails/CollectionNotificationEmail");

var _DocumentNotificationEmail = require("./emails/DocumentNotificationEmail");

var _ExportEmail = require("./emails/ExportEmail");

var _InviteEmail = require("./emails/InviteEmail");

var _SigninEmail = require("./emails/SigninEmail");

var _WelcomeEmail = require("./emails/WelcomeEmail");

var _EmailLayout = require("./emails/components/EmailLayout");

var _queue = require("./utils/queue");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const log = (0, _debug.default)("emails");
const useTestEmailService = process.env.NODE_ENV === "development" && !process.env.SMTP_USERNAME;

/**
 * Mailer
 *
 * Mailer class to contruct and send emails.
 *
 * To preview emails, add a new preview to `emails/index.js` if they
 * require additional data (properties). Otherwise preview will work automatically.
 *
 * HTML: http://localhost:3000/email/:email_type/html
 * TEXT: http://localhost:3000/email/:email_type/text
 */
class Mailer {
  constructor() {
    this.sendMail = async data => {
      const {
        transporter
      } = this;

      if (transporter) {
        const html = _oyVey.default.renderTemplate(data.html, {
          title: data.title,
          headCSS: [_EmailLayout.baseStyles, data.headCSS].join(" "),
          previewText: data.previewText
        });

        try {
          log(`Sending email "${data.title}" to ${data.to}`);
          const info = await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            replyTo: process.env.SMTP_REPLY_EMAIL || process.env.SMTP_FROM_EMAIL,
            to: data.to,
            subject: data.title,
            html: html,
            text: data.text,
            attachments: data.attachments
          });

          if (useTestEmailService) {
            log("Email Preview URL: %s", _nodemailer.default.getTestMessageUrl(info));
          }
        } catch (err) {
          if (process.env.SENTRY_DSN) {
            Sentry.captureException(err);
          }

          throw err; // Re-throw for queue to re-try
        }
      }
    };

    this.welcome = async opts => {
      this.sendMail({
        to: opts.to,
        title: "Welcome to Outline",
        previewText: "Outline is a place for your team to build and share knowledge.",
        html: /*#__PURE__*/React.createElement(_WelcomeEmail.WelcomeEmail, opts),
        text: (0, _WelcomeEmail.welcomeEmailText)(opts)
      });
    };

    this.export = async opts => {
      this.sendMail({
        to: opts.to,
        attachments: opts.attachments,
        title: "Your requested export",
        previewText: "Here's your request data export from Outline",
        html: /*#__PURE__*/React.createElement(_ExportEmail.ExportEmail, null),
        text: _ExportEmail.exportEmailText
      });
    };

    this.invite = async opts => {
      this.sendMail({
        to: opts.to,
        title: `${opts.actorName} invited you to join ${opts.teamName}’s knowledge base`,
        previewText: "Outline is a place for your team to build and share knowledge.",
        html: /*#__PURE__*/React.createElement(_InviteEmail.InviteEmail, opts),
        text: (0, _InviteEmail.inviteEmailText)(opts)
      });
    };

    this.signin = async opts => {
      this.sendMail({
        to: opts.to,
        title: "Magic signin link",
        previewText: "Here’s your link to signin to Outline.",
        html: /*#__PURE__*/React.createElement(_SigninEmail.SigninEmail, opts),
        text: (0, _SigninEmail.signinEmailText)(opts)
      });
    };

    this.documentNotification = async opts => {
      this.sendMail({
        to: opts.to,
        title: `“${opts.document.title}” ${opts.eventName}`,
        previewText: `${opts.actor.name} ${opts.eventName} a new document`,
        html: /*#__PURE__*/React.createElement(_DocumentNotificationEmail.DocumentNotificationEmail, opts),
        text: (0, _DocumentNotificationEmail.documentNotificationEmailText)(opts)
      });
    };

    this.collectionNotification = async opts => {
      this.sendMail({
        to: opts.to,
        title: `“${opts.collection.name}” ${opts.eventName}`,
        previewText: `${opts.actor.name} ${opts.eventName} a collection`,
        html: /*#__PURE__*/React.createElement(_CollectionNotificationEmail.CollectionNotificationEmail, opts),
        text: (0, _CollectionNotificationEmail.collectionNotificationEmailText)(opts)
      });
    };

    this.loadTransport();
  }

  async loadTransport() {
    if (process.env.SMTP_HOST) {
      let smtpConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: "SMTP_SECURE" in process.env ? process.env.SMTP_SECURE === "true" : process.env.NODE_ENV === "production",
        auth: undefined,
        tls: "SMTP_TLS_CIPHERS" in process.env ? {
          ciphers: process.env.SMTP_TLS_CIPHERS
        } : undefined
      };

      if (process.env.SMTP_USERNAME) {
        smtpConfig.auth = {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD
        };
      }

      this.transporter = _nodemailer.default.createTransport(smtpConfig);
      return;
    }

    if (useTestEmailService) {
      log("SMTP_USERNAME not provided, generating test account…");

      try {
        let testAccount = await _nodemailer.default.createTestAccount();
        const smtpConfig = {
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        };
        this.transporter = _nodemailer.default.createTransport(smtpConfig);
      } catch (err) {
        log(`Could not generate test account: ${err.message}`);
      }
    }
  }

}

exports.Mailer = Mailer;
const mailer = new Mailer();
var _default = mailer;
exports.default = _default;
const mailerQueue = (0, _queue.createQueue)("email");
exports.mailerQueue = mailerQueue;
mailerQueue.process(async job => {
  // $FlowIssue flow doesn't like dynamic values
  await mailer[job.data.type](job.data.opts);
});

const sendEmail = (type, to, options = {}) => {
  mailerQueue.add({
    type,
    opts: {
      to,
      ...options
    }
  }, {
    attempts: 5,
    removeOnComplete: true,
    backoff: {
      type: "exponential",
      delay: 60 * 1000
    }
  });
};

exports.sendEmail = sendEmail;