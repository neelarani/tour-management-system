/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { envVars } from '../config/env';
import AppError from '../errorHelpers/AppError';
import { handlerDuplicateError } from '../helpers/handleDuplicateError';
import { handleCastError } from '../helpers/handleCastError';
import { HandleValidationError } from '../helpers/handleValidationError';
import { handleZodError } from '../helpers/handleZodError';
import { TErrorSources } from '../interfaces/error.types';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envVars.NODE_ENV === 'development') {
    console.log(err);
  }

  let errorSources: TErrorSources[] = [];
  let status = 500;
  // let msg = err instanceof Error && err.message;
  let msg = 'Something went wrong';

  // Duplicate error
  if (err.code === 11000) {
    const simplifiedError = handlerDuplicateError(err);
    status = simplifiedError.status;
    msg = simplifiedError.message;
  }
  // Object id error / cast error
  else if (err.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    status = simplifiedError.status;
    msg = simplifiedError.message;
  }
  // Mongoose Validation Error
  else if (err.name === 'validationError') {
    const simplifiedError = HandleValidationError(err);
    status = simplifiedError.status;
    errorSources = simplifiedError.errorSources as TErrorSources[];
    msg = simplifiedError.message;
  }
  // Zod Error
  else if (err.name === 'zodError') {
    const simplifiedError = handleZodError(err);
    status = simplifiedError.status;
    msg = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];
  } else if (err instanceof AppError) {
    status = err.statusCode;
    msg = err.message;
  } else if (err instanceof Error) {
    status = 500;
    msg = err.message;
  }

  res.status(status).json({
    success: false,
    msg,
    errorSources,
    err: envVars.NODE_ENV === 'development' ? err : null,
    stack: envVars.NODE_ENV === 'development' ? err.stack : null,
  });
};
