export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

function makeError(statusCode: number) {
  return (message: string) => new AppError(message, statusCode);
}

export const Errors = {
  missingToken: () => makeError(401)("Missing access token"),
  invalidToken: () => makeError(401)("Invalid or expired access token"),
  tokenRevoked: () => makeError(401)("Token has been revoked"),
  invalidCredentials: () => makeError(401)("Invalid email or password"),
  userNotFound: () => makeError(401)("User no longer exists"),
  invitationNotFound: () => makeError(404)("Invitation not found"),
  invitationAlreadyAccepted: () => makeError(409)("This invitation has already been accepted"),
  invitationExpired: () => makeError(409)("This invitation has expired"),
  emailAlreadyRegistered: (email: string) => makeError(409)(`Email already registered: ${email}`),
  emailAlreadyHasAccount: (email: string) => makeError(409)(`An account already exists for ${email}`),
  forbidden: (message: string) => makeError(403)(message),
};
