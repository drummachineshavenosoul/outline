"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentImporter;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _file = _interopRequireDefault(require("formidable/lib/file"));

var _joplinTurndownPluginGfm = require("joplin-turndown-plugin-gfm");

var _mammoth = _interopRequireDefault(require("mammoth"));

var _quotedPrintable = _interopRequireDefault(require("quoted-printable"));

var _turndown = _interopRequireDefault(require("turndown"));

var _utf = _interopRequireDefault(require("utf8"));

var _parseTitle = _interopRequireDefault(require("../../shared/utils/parseTitle"));

var _errors = require("../errors");

var _models = require("../models");

var _dataURItoBuffer = _interopRequireDefault(require("../utils/dataURItoBuffer"));

var _fs2 = require("../utils/fs");

var _parseImages = _interopRequireDefault(require("../utils/parseImages"));

var _attachmentCreator = _interopRequireDefault(require("./attachmentCreator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// https://github.com/domchristie/turndown#options
const turndownService = new _turndown.default({
  hr: "---",
  bulletListMarker: "-",
  headingStyle: "atx"
}); // Use the GitHub-flavored markdown plugin to parse
// strikethoughs and tables

turndownService.use(_joplinTurndownPluginGfm.strikethrough).use(_joplinTurndownPluginGfm.tables).addRule("breaks", {
  filter: ["br"],
  replacement: function (content) {
    return "\n";
  }
});
const importMapping = [{
  type: "application/msword",
  getMarkdown: confluenceToMarkdown
}, {
  type: "application/octet-stream",
  getMarkdown: docxToMarkdown
}, {
  type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  getMarkdown: docxToMarkdown
}, {
  type: "text/html",
  getMarkdown: htmlToMarkdown
}, {
  type: "text/plain",
  getMarkdown: fileToMarkdown
}, {
  type: "text/markdown",
  getMarkdown: fileToMarkdown
}];

async function fileToMarkdown(file) {
  return _fs.default.promises.readFile(file.path, "utf8");
}

async function docxToMarkdown(file) {
  const {
    value
  } = await _mammoth.default.convertToHtml(file);
  return turndownService.turndown(value);
}

async function htmlToMarkdown(file) {
  const value = await _fs.default.promises.readFile(file.path, "utf8");
  return turndownService.turndown(value);
}

async function confluenceToMarkdown(file) {
  let value = await _fs.default.promises.readFile(file.path, "utf8"); // We're only supporting the ridiculous output from Confluence here, regular
  // Word documents should call into the docxToMarkdown importer.
  // See: https://jira.atlassian.com/browse/CONFSERVER-38237

  if (!value.includes("Content-Type: multipart/related")) {
    throw new _errors.FileImportError("Unsupported Word file");
  } // get boundary marker


  const boundaryMarker = value.match(/boundary="(.+)"/);

  if (!boundaryMarker) {
    throw new _errors.FileImportError("Unsupported Word file (No boundary marker)");
  } // get content between multipart boundaries


  let boundaryReached = 0;
  const lines = value.split("\n").filter(line => {
    if (line.includes(boundaryMarker[1])) {
      boundaryReached++;
      return false;
    }

    if (line.startsWith("Content-")) {
      return false;
    } // 1 == definition
    // 2 == content
    // 3 == ending


    if (boundaryReached === 2) {
      return true;
    }

    return false;
  });

  if (!lines.length) {
    throw new _errors.FileImportError("Unsupported Word file (No content found)");
  } // Mime attachment is "quoted printable" encoded, must be decoded first
  // https://en.wikipedia.org/wiki/Quoted-printable


  value = _utf.default.decode(_quotedPrintable.default.decode(lines.join("\n"))); // If we don't remove the title here it becomes printed in the document
  // body by turndown

  turndownService.remove(["style", "xml", "title"]); // Now we should have something that looks like HTML

  const html = turndownService.turndown(value);
  return html.replace(/<br>/g, " \\n ");
}

async function documentImporter({
  file,
  user,
  ip
}) {
  const fileInfo = importMapping.filter(item => {
    if (item.type === file.type) {
      if (file.type === "application/octet-stream" && _path.default.extname(file.name) !== ".docx") {
        return false;
      }

      return true;
    }

    if (item.type === "text/markdown" && _path.default.extname(file.name) === ".md") {
      return true;
    }

    return false;
  })[0];

  if (!fileInfo) {
    throw new _errors.InvalidRequestError(`File type ${file.type} not supported`);
  }

  let title = (0, _fs2.deserializeFilename)(file.name.replace(/\.[^/.]+$/, ""));
  let text = await fileInfo.getMarkdown(file); // If the first line of the imported text looks like a markdown heading
  // then we can use this as the document title

  if (text.trim().startsWith("# ")) {
    const result = (0, _parseTitle.default)(text);
    title = result.title;
    text = text.replace(`# ${title}\n`, "");
  } // find data urls, convert to blobs, upload and write attachments


  const images = (0, _parseImages.default)(text);
  const dataURIs = images.filter(href => href.startsWith("data:"));

  for (const uri of dataURIs) {
    const name = "imported";
    const {
      buffer,
      type
    } = (0, _dataURItoBuffer.default)(uri);
    const attachment = await (0, _attachmentCreator.default)({
      name,
      type,
      buffer,
      user,
      ip
    });
    text = text.replace(uri, attachment.redirectUrl);
  }

  return {
    text,
    title
  };
}