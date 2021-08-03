"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subtractDate = subtractDate;

var _dateFns = require("date-fns");

function subtractDate(date, period) {
  switch (period) {
    case "day":
      return (0, _dateFns.subDays)(date, 1);

    case "week":
      return (0, _dateFns.subWeeks)(date, 1);

    case "month":
      return (0, _dateFns.subMonths)(date, 1);

    case "year":
      return (0, _dateFns.subYears)(date, 1);

    default:
      return date;
  }
}