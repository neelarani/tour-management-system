class AppError extends Error {
  public statusCode: number;

  constructor(statuscode: number, message: string, stack: any = '') {
    super(message);
    this.name = 'AppError';
    this.message = message;
    this.statusCode = statuscode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
