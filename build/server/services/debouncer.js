"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _events = _interopRequireDefault(require("../events"));

var _models = require("../models");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Debouncer {
  async on(event) {
    switch (event.name) {
      case "documents.update":
        {
          _events.default.add({ ...event,
            name: "documents.update.delayed"
          }, {
            delay: 5 * 60 * 1000,
            removeOnComplete: true
          });

          break;
        }

      case "documents.update.delayed":
        {
          const document = await _models.Document.findByPk(event.documentId); // If the document has been deleted then prevent further processing

          if (!document) return; // If the document has been updated since we initially queued the delayed
          // event then abort, there must be another updated event in the queue –
          // this functions as a simple distributed debounce.

          if (document.updatedAt > new Date(event.createdAt)) return;

          _events.default.add({ ...event,
            name: "documents.update.debounced"
          }, {
            removeOnComplete: true
          });

          break;
        }

      default:
    }
  }

}

exports.default = Debouncer;