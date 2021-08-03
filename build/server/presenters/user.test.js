"use strict";

var _user = _interopRequireDefault(require("./user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable flowtype/require-valid-file-annotation */
it("presents a user", async () => {
  const user = (0, _user.default)({
    id: "123",
    name: "Test User",
    username: "testuser"
  });
  expect(user).toMatchSnapshot();
});
it("presents a user without slack data", async () => {
  const user = (0, _user.default)({
    id: "123",
    name: "Test User",
    username: "testuser"
  });
  expect(user).toMatchSnapshot();
});