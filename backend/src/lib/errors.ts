export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class MissingTokenError extends AppError {
  constructor() {
    super("Missing access token", 401);
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super("Invalid or expired access token", 401);
  }
}

export class TokenRevokedError extends AppError {
  constructor() {
    super("Token has been revoked", 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}
