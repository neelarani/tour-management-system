import httpStatus from 'http-status-codes';
import { UserServices } from './user.service';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

const createUser = catchAsync(async (req, res) => {
  const user = await UserServices.createUser(req.body);

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

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsers();
  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'All Users Retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const UserControllers = {
  createUser,
  getAllUsers,
  updateUser,
};
