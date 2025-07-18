import { Response } from 'express';

interface TMeta {
  total: number;
}

interface TResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
}

export const sendResponse = <T>(res: Response, info: TResponse<T>) => {
  res.status(info.status).json({
    success: info.success,
    message: info.message,
    status: info.status,
    meta: info.meta,
    data: info.data,
  });
};
