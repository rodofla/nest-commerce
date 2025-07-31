import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const RawHeaders = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.rawHeaders;
  },
);
