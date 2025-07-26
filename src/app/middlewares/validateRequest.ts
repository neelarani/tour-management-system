import { AnyZodObject } from 'zod';
import { catchAsync } from '../utils/catchAsync';

export const validateRequest = (zodSchema: AnyZodObject) =>
  catchAsync(async (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }

    req.body = await zodSchema.parseAsync(req.body);

    next();
  });
