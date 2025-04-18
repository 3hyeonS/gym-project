import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { UserEntity } from 'src/auth/entity/user/user.entity';

export const GetOptionalUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity | CenterEntity | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
  },
);
