import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export interface JwtUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
}

export const GetUser = createParamDecorator<keyof JwtUser>(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: JwtUser }>();
    const user = req.user;
    if (!user) {
      throw new InternalServerErrorException('User not found in request');
    }
    return !data ? user : user[data];
  },
);
