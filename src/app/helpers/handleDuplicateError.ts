import { TGenericErrorResponse } from '../interfaces/error.types';

export const handlerDuplicateError = (err: any): TGenericErrorResponse => {
  const matchedArray = err.message.match(/"([^"]*)"/);
  return {
    status: 400,
    message: `${matchedArray[1]} already exists!`,
  };
};
