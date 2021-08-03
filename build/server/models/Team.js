"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _url = require("url");

var _util = _interopRequireDefault(require("util"));

var _uuid = require("uuid");

var _domains = require("../../shared/utils/domains");

var _sequelize = require("../sequelize");

var _avatars = require("../utils/avatars");

var _s = require("../utils/s3");

var _Collection = _interopRequireDefault(require("./Collection"));

var _Document = _interopRequireDefault(require("./Document"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readFile = _util.default.promisify(_fs.default.readFile);

const Team = _sequelize.sequelize.define("team", {
  id: {
    type: _sequelize.DataTypes.UUID,
    defaultValue: _sequelize.DataTypes.UUIDV4,
    primaryKey: true
  },
  name: _sequelize.DataTypes.STRING,
  subdomain: {
    type: _sequelize.DataTypes.STRING,
    allowNull: true,
    validate: {
      isLowercase: true,
      is: {
        args: [/^[a-z\d-]+$/, "i"],
        msg: "Must be only alphanumeric and dashes"
      },
      len: {
        args: [4, 32],
        msg: "Must be between 4 and 32 characters"
      },
      notIn: {
        args: [_domains.RESERVED_SUBDOMAINS],
        msg: "You chose a restricted word, please try another."
      }
    },
    unique: true
  },
  domain: {
    type: _sequelize.DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  slackId: {
    type: _sequelize.DataTypes.STRING,
    allowNull: true
  },
  googleId: {
    type: _sequelize.DataTypes.STRING,
    allowNull: true
  },
  avatarUrl: {
    type: _sequelize.DataTypes.STRING,
    allowNull: true
  },
  sharing: {
    type: _sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  signupQueryParams: {
    type: _sequelize.DataTypes.JSONB,
    allowNull: true
  },
  guestSignin: {
    type: _sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  documentEmbeds: {
    type: _sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  paranoid: true,
  getterMethods: {
    url() {
      if (this.domain) {
        return `https://${this.domain}`;
      }

      if (!this.subdomain || process.env.SUBDOMAINS_ENABLED !== "true") {
        return process.env.URL;
      }

      const url = new _url.URL(process.env.URL);
      url.host = `${this.subdomain}.${(0, _domains.stripSubdomain)(url.host)}`;
      return url.href.replace(/\/$/, "");
    },

    logoUrl() {
      return this.avatarUrl || (0, _avatars.generateAvatarUrl)({
        id: this.id,
        name: this.name
      });
    }

  }
});

Team.associate = models => {
  Team.hasMany(models.Collection, {
    as: "collections"
  });
  Team.hasMany(models.Document, {
    as: "documents"
  });
  Team.hasMany(models.User, {
    as: "users"
  });
  Team.hasMany(models.AuthenticationProvider, {
    as: "authenticationProviders"
  });
  Team.addScope("withAuthenticationProviders", {
    include: [{
      model: models.AuthenticationProvider,
      as: "authenticationProviders"
    }]
  });
};

const uploadAvatar = async model => {
  const endpoint = (0, _s.publicS3Endpoint)();
  const {
    avatarUrl
  } = model;

  if (avatarUrl && !avatarUrl.startsWith("/api") && !avatarUrl.startsWith(endpoint)) {
    try {
      const newUrl = await (0, _s.uploadToS3FromUrl)(avatarUrl, `avatars/${model.id}/${(0, _uuid.v4)()}`, "public-read");
      if (newUrl) model.avatarUrl = newUrl;
    } catch (err) {
      // we can try again next time
      console.error(err);
    }
  }
};

Team.prototype.provisionSubdomain = async function (requestedSubdomain, options = {}) {
  if (this.subdomain) return this.subdomain;
  let subdomain = requestedSubdomain;
  let append = 0;

  while (true) {
    try {
      await this.update({
        subdomain
      }, options);
      break;
    } catch (err) {
      // subdomain was invalid or already used, try again
      subdomain = `${requestedSubdomain}${++append}`;
    }
  }

  return subdomain;
};

Team.prototype.provisionFirstCollection = async function (userId) {
  const collection = await _Collection.default.create({
    name: "Welcome",
    description: "This collection is a quick guide to what Outline is all about. Feel free to delete this collection once your team is up to speed with the basics!",
    teamId: this.id,
    createdById: userId,
    sort: _Collection.default.DEFAULT_SORT,
    permission: "read_write"
  }); // For the first collection we go ahead and create some intitial documents to get
  // the team started. You can edit these in /server/onboarding/x.md

  const onboardingDocs = ["Integrations & API", "Our Editor", "Getting Started", "What is Outline"];

  for (const title of onboardingDocs) {
    const text = await readFile(_path.default.join(process.cwd(), "server", "onboarding", `${title}.md`), "utf8");
    const document = await _Document.default.create({
      version: 2,
      isWelcome: true,
      parentDocumentId: null,
      collectionId: collection.id,
      teamId: collection.teamId,
      userId: collection.createdById,
      lastModifiedById: collection.createdById,
      createdById: collection.createdById,
      title,
      text
    });
    await document.publish(collection.createdById);
  }
};

Team.prototype.collectionIds = async function (paranoid = true) {
  let models = await _Collection.default.findAll({
    attributes: ["id"],
    where: {
      teamId: this.id,
      permission: {
        [_sequelize.Op.ne]: null
      }
    },
    paranoid
  });
  return models.map(c => c.id);
};

Team.beforeSave(uploadAvatar);
var _default = Team;
exports.default = _default;