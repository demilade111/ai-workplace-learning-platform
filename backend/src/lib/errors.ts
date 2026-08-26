type ErrorStatusCode = 401 | 403 | 404 | 409;

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: ErrorStatusCode,
  ) {
    super(message);
    this.name = "AppError";
  }
}

function makeError(statusCode: ErrorStatusCode) {
  return (message: string) => new AppError(message, statusCode);
}

const asUnauthorized = makeError(401);
const asForbidden = makeError(403);
const asNotFound = makeError(404);
const asConflict = makeError(409);

export const Errors = {
  missingToken: () => asUnauthorized("Missing access token"),
  invalidToken: () => asUnauthorized("Invalid or expired access token"),
  tokenRevoked: () => asUnauthorized("Token has been revoked"),
  invalidCredentials: () => asUnauthorized("Invalid email or password"),
  userNotFound: () => asUnauthorized("User no longer exists"),
  invitationNotFound: () => asNotFound("Invitation not found"),
  invitationAlreadyAccepted: () => asConflict("This invitation has already been accepted"),
  invitationExpired: () => asConflict("This invitation has expired"),
  emailAlreadyRegistered: (email: string) => asConflict(`Email already registered: ${email}`),
  emailAlreadyHasAccount: (email: string) => asConflict(`An account already exists for ${email}`),
  forbidden: (message: string) => asForbidden(message),
  notFound: (message: string) => asNotFound(message),
};
