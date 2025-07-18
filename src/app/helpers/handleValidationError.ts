import mongoose from 'mongoose';
import {
  TErrorSources,
  TGenericErrorResponse,
} from '../interfaces/error.types';

export const HandleValidationError = (
  err: mongoose.Error.ValidationError
): TGenericErrorResponse => {
  let errorSources: TErrorSources[] = [];
  const errors = Object.values(err.errors);

  errors.forEach((errorObj: any) =>
    errorSources.push({
      path: errorObj.path,
      message: errorObj.message,
    })
  );

  return {
    status: 400,
    message: 'Validation Error',
    errorSources,
  };
};
