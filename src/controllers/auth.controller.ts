import validator from 'validator';
import uuid from 'uuid';
import * as process from 'process';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { addMinutes } from 'date-fns';
import createError from 'http-errors';
import { IncomingHttpHeaders } from 'http';

import { User, UserModel } from '../models/user';
import { ClientInfo, RefreshTokenModel } from '../models/refresh-token';
import { comparePasswords, hashPassword } from '../helpers/hash.helper';
import { stringToRole } from '../helpers/utils.helper';
import { EmailAgent } from '../agents/email.agent';
import { Email } from '../models/email';

const createToken = (user: any) => {
  return jwt.sign(user, process.env['JWT_SECRET'], {
    expiresIn: process.env['TOKEN_EXPIRES_IN']
  });
};

export const login = async (email: string, password: string, clientInfo: ClientInfo) => {
  // Your solution here
  if (!validator.isEmail(email)) {
    return false
  }

  const existingUser = await UserModel.getByEmail(email, false);

  if (!existingUser) {
    return false
  }
  const isMatch = comparePasswords(password, existingUser.password);

  if (!isMatch) {
    return false
  }
  return createToken({
    id: existingUser._id,
    email: existingUser.email,
    roles: [stringToRole(existingUser.role)]
  })
};

export const refreshToken = async (refreshToken: string, headers: IncomingHttpHeaders) => {
  // Your solution here
  const tokenPayload = jwt.verify(refreshToken, process.env["JWT_SECRET"]) as JwtPayload;

  const existingRefreshToken = await RefreshTokenModel.getByToken(refreshToken);

  if (existingRefreshToken) {
    throw new Error('Token already exist');
  }
  const clientInfo: ClientInfo = {
    browser: '',
    browser_version: '',
    device: '',
    id: '',
    os: '',
    os_version: '',
    userAgent: headers['user-agent'],
    version: ''
  }
  const response = await RefreshTokenModel.add(refreshToken,
    new Date(tokenPayload.exp * 1000), tokenPayload.id, clientInfo);

  return { token: response._id };
};

export const register = async (user: User) => {
  // Your solution here
  if (!validator.isEmail(user.email)) {
    throw new Error('Invalid email address');
  }
  const existingUser = await UserModel.getByEmail(user.email, false);
  if (existingUser) {
    return {
      exists: true
    };
  }
  return await UserModel.add(user);
};

export const forgotPassword = async (email: string) => {
  try {
    const existingUser = await UserModel.getByEmail(email);
    if (!existingUser) {
      throw createError(403, 'There was a problem. User does not exist');
    }
    const now = new Date();
    const passwordResetTokenExpires = addMinutes(now, 10);
    const passwordResetToken = uuid.v4();
    await existingUser.updateOne({
      passwordResetTokenExpires,
      passwordResetToken,
      updatedAt: now
    });
    console.log('reset token:', passwordResetToken);
    console.log('reset token:', email);

    const sendResponse = await EmailAgent.send(email, Email.ResetPassword, { passwordResetToken, passwordResetTokenExpires }, "Subject Extra");
    console.log('sendResponse:', sendResponse);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string, password: string, token: string) => {
  try {
    const user = await UserModel.getByEmail(email, false);
    if (!user) {
      throw createError(403, 'There was a problem reseting your password. User does not exist');
    }
    if (user.passwordResetToken !== token) {
      throw createError(403, 'There was a problem reseting your password. Invalid Token');
    }
    console.log(user.passwordResetTokenExpires)
    if (user.passwordResetTokenExpires < new Date()) {
      throw createError(403, 'There was a problem reseting your password. Token expired');
    }
    const hashedPassword = hashPassword(password);
    await user.updateOne({ password: hashedPassword });
    return { success: true };
  } catch (error) {
    throw error;
  }
};
