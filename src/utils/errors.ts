import { StatusCode } from 'hono/utils/http-status';

export type AppErrorOptions = {
  name: string;
  statusCode: StatusCode;
  message: string;
  publicDetails?: Record<string, unknown>;
  privateContext?: Record<string, unknown>;
};

export class AppError extends Error {
  statusCode: StatusCode;
  publicDetails?: Record<string, unknown>;
  privateContext?: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = options.name;
    this.statusCode = options.statusCode;
    this.publicDetails = options.publicDetails;
    this.privateContext = options.privateContext;
  }

  toLog() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      publicDetails: this.publicDetails,
      privateContext: this.privateContext,
    };
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        details: this.publicDetails,
      },
    };
  }
}

type AdditionalErrorOptions = {
  publicDetails?: Record<string, unknown>;
  privateContext?: Record<string, unknown>;
};

export class BadRequestError extends AppError {
  constructor(message: string, options?: AdditionalErrorOptions) {
    super({ name: 'BadRequestError', statusCode: 400, message, ...options });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, options?: AdditionalErrorOptions) {
    super({ name: 'UnauthorizedError', statusCode: 401, message, ...options });
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, options?: AdditionalErrorOptions) {
    super({ name: 'ForbiddenError', statusCode: 403, message, ...options });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, options?: AdditionalErrorOptions) {
    super({ name: 'NotFoundError', statusCode: 404, message, ...options });
  }
}

export class RateLimitExceededError extends AppError {
  constructor(message: string, options?: AdditionalErrorOptions) {
    super({
      name: 'RateLimitExceededError',
      statusCode: 429,
      message,
      ...options,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(options?: AdditionalErrorOptions) {
    super({
      name: 'InternalServerError',
      message: 'Something bad happened',
      statusCode: 500,
      ...options,
    });
  }
}
