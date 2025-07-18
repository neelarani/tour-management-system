import { NextFunction, Request, Response } from 'express';
import { envVars } from '../config/env';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const catchAsync =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      next(err);
    });
  };
