import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';
import httpStatus from 'http-status-codes';
import bcrypt from 'bcryptjs';

import { createNewAccessTokenWithRefreshToken } from '../../utils/user.tokens';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';

// const credentialsLogin = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;

//   const isUserExist = await User.findOne({ email });

//   if (!isUserExist) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'User does not Exist');
//   }

//   const isPasswordMatched = await bcrypt.compare(
//     password as string,
//     isUserExist.password as string
//   );

//   if (!isPasswordMatched) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Incorrect Password');
//   }

//   const userTokens = createUserTokens(isUserExist);

//   const { password: pass, ...rest } = isUserExist.toObject();

//   return {
//     accessToken: userTokens.accessToken,
//     refreshToken: userTokens.refreshToken,
//     user: rest,
//   };
// };

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );
  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcrypt.compare(
    oldPassword,
    user!.password as string
  );

  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Old Password does not match');
  }

  user!.password = await bcrypt.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user!.save();
};

export const AuthServices = {
  // credentialsLogin,
  getNewAccessToken,
  resetPassword,
};
