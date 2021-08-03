"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticationError = AuthenticationError;
exports.AuthorizationError = AuthorizationError;
exports.AdminRequiredError = AdminRequiredError;
exports.UserSuspendedError = UserSuspendedError;
exports.InvalidRequestError = InvalidRequestError;
exports.NotFoundError = NotFoundError;
exports.ParamRequiredError = ParamRequiredError;
exports.ValidationError = ValidationError;
exports.EditorUpdateError = EditorUpdateError;
exports.FileImportError = FileImportError;
exports.OAuthStateMismatchError = OAuthStateMismatchError;
exports.MaximumTeamsError = MaximumTeamsError;
exports.EmailAuthenticationRequiredError = EmailAuthenticationRequiredError;
exports.MicrosoftGraphError = MicrosoftGraphError;
exports.GoogleWorkspaceRequiredError = GoogleWorkspaceRequiredError;
exports.GoogleWorkspaceInvalidError = GoogleWorkspaceInvalidError;
exports.AuthenticationProviderDisabledError = AuthenticationProviderDisabledError;

var _httpErrors = _interopRequireDefault(require("http-errors"));

var _env = _interopRequireDefault(require("./env"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function AuthenticationError(message = "Invalid authentication", redirectUrl = _env.default.URL) {
  return (0, _httpErrors.default)(401, message, {
    redirectUrl,
    id: "authentication_required"
  });
}

function AuthorizationError(message = "You do not have permission to access this resource") {
  return (0, _httpErrors.default)(403, message, {
    id: "permission_required"
  });
}

function AdminRequiredError(message = "An admin role is required to access this resource") {
  return (0, _httpErrors.default)(403, message, {
    id: "admin_required"
  });
}

function UserSuspendedError({
  adminEmail
}) {
  return (0, _httpErrors.default)(403, "Your access has been suspended by the team admin", {
    id: "user_suspended",
    errorData: {
      adminEmail
    }
  });
}

function InvalidRequestError(message = "Request invalid") {
  return (0, _httpErrors.default)(400, message, {
    id: "invalid_request"
  });
}

function NotFoundError(message = "Resource not found") {
  return (0, _httpErrors.default)(404, message, {
    id: "not_found"
  });
}

function ParamRequiredError(message = "Required parameter missing") {
  return (0, _httpErrors.default)(400, message, {
    id: "param_required"
  });
}

function ValidationError(message = "Validation failed") {
  return (0, _httpErrors.default)(400, message, {
    id: "validation_error"
  });
}

function EditorUpdateError(message = "The client editor is out of date and must be reloaded") {
  return (0, _httpErrors.default)(400, message, {
    id: "editor_update_required"
  });
}

function FileImportError(message = "The file could not be imported") {
  return (0, _httpErrors.default)(400, message, {
    id: "import_error"
  });
}

function OAuthStateMismatchError(message = "State returned in OAuth flow did not match") {
  return (0, _httpErrors.default)(400, message, {
    id: "state_mismatch"
  });
}

function MaximumTeamsError(message = "The maximum number of teams has been reached") {
  return (0, _httpErrors.default)(400, message, {
    id: "maximum_teams"
  });
}

function EmailAuthenticationRequiredError(message = "User must authenticate with email", redirectUrl = _env.default.URL) {
  return (0, _httpErrors.default)(400, message, {
    redirectUrl,
    id: "email_auth_required"
  });
}

function MicrosoftGraphError(message = "Microsoft Graph API did not return required fields") {
  return (0, _httpErrors.default)(400, message, {
    id: "graph_error"
  });
}

function GoogleWorkspaceRequiredError(message = "Google Workspace is required to authenticate") {
  return (0, _httpErrors.default)(400, message, {
    id: "google_hd"
  });
}

function GoogleWorkspaceInvalidError(message = "Google Workspace is invalid") {
  return (0, _httpErrors.default)(400, message, {
    id: "hd_not_allowed"
  });
}

function AuthenticationProviderDisabledError(message = "Authentication method has been disabled by an admin", redirectUrl = _env.default.URL) {
  return (0, _httpErrors.default)(400, message, {
    redirectUrl,
    id: "authentication_provider_disabled"
  });
}