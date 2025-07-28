import httpStatus from 'http-status-codes';
import { UserServices } from './user.service';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';

import { JwtPayload } from 'jsonwebtoken';

const createUser = catchAsync(async (req, res) => {
  const user = await UserServices.createUser(req.body || {});

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'User Created successfully',
    data: user,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  // const token = req.headers.authorization;
  // const verifiedToken = verifyToken(
  //   token as string,
  //   envVars.JWT_ACCESS_SECRET
  // ) as JwtPayload;

  const verifiedToken = req.user;

  const payload = req.body;

  const user = await UserServices.updateUser(
    userId,
    payload,
    verifiedToken as JwtPayload
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'User Updated successfully',
    data: user,
  });
});

const getAllUsers = catchAsync(async (req, res, next) => {
  const query = req.query;
  const result = await UserServices.getAllUsers(
    query as Record<string, string>
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'All Users Retrieved Successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const decodedToken = req.user as JwtPayload;
  const result = await UserServices.getMe(decodedToken.userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'Your profile Retrieved Successfully',
    data: result.data,
  });
});

const getSingleUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const result = await UserServices.getSingleUser(id);
  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'User Retrieved Successfully',
    data: result.data,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  updateUser,
  getMe,
  getSingleUser,
};
