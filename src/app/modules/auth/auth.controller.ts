import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';
import { AuthServices } from './auth.service';
import AppError from '../../errorHelpers/AppError';
import { setAuthCookie } from '../../utils/setCookie';
import { createUserTokens } from '../../utils/user.tokens';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import passport from 'passport';
import { NextFunction, Request, Response } from 'express';

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) {
        // return next(err);

        return next(new AppError(401, err));
      }

      if (!user) {
        return next(new AppError(401, info.message));
      }

      const userTokens = await createUserTokens(user);

      // delete user.toObject().passport;

      const { password: pass, ...rest } = user.toObject();

      setAuthCookie(res, userTokens);

      sendResponse(res, {
        success: true,
        status: httpStatus.CREATED,
        message: 'User loged in successfully',
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  }
);

const getNewAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'No refresh token recieved from cookies'
    );
  }
  const tokenInfo = await AuthServices.getNewAccessToken(
    refreshToken as string
  );

  setAuthCookie(res, tokenInfo);

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'New access token retrived successfully',
    data: tokenInfo,
  });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'User Logged Out Successfully',
    data: null,
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const decodedToken = req.user;

  console.log('req', req.user);
  await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Password Changed Successfully',
    data: null,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const decodedToken = req.user;

  await AuthServices.changePassword(
    oldPassword,
    newPassword,
    decodedToken as JwtPayload
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Password Changed Successfully',
    data: null,
  });
});

const setPassword = catchAsync(async (req, res) => {
  const decodedToken = req.user as JwtPayload;
  const { password } = req.body;

  await AuthServices.setPassword(decodedToken.userId, password);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Password Changed Successfully',
    data: null,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  await AuthServices.forgotPassword(email);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Email Send Successfully!',
    data: null,
  });
});

const googleCallbackController = catchAsync(async (req, res) => {
  let redirectTo = req.query.state ? (req.query.state as string) : '';

  if (redirectTo.startsWith('/')) {
    redirectTo = redirectTo.slice(1);
  }

  const user = req.user;

  console.log('user', user);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User Not Found!');
  }
  const tokenInfo = createUserTokens(user);

  setAuthCookie(res, tokenInfo);

  res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
});

export const AuthControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  changePassword,
  setPassword,
  forgotPassword,
  googleCallbackController,
};
