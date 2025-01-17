import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { UserEntity } from 'src/auth/entity/user.entity';

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): UserEntity | CenterEntity => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
