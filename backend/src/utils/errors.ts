export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(message = 'Not found'): AppError {
  return new AppError(message, 404, 'NOT_FOUND');
}

export function validationError(message: string): AppError {
  return new AppError(message, 400, 'VALIDATION_ERROR');
}

export function conflict(message: string): AppError {
  return new AppError(message, 409, 'CONFLICT');
}

export function unauthorized(message = 'Unauthorized'): AppError {
  return new AppError(message, 401, 'UNAUTHORIZED');
}
