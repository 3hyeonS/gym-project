import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from './entity/user.entity';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles-decorator';
import { CenterEntity } from './entity/center.entity';
import { TRole } from './entity/member.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 핸들러 또는 클래스에 설정된 역할을 가져오기
    const requiredRoles = this.reflector.getAllAndOverride<TRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 설정된 역할이 없는(==권한설정을 하지 않은) 핸들러는 기본적으로 true를 반환해 접근을 허용
    if (!requiredRoles) {
      return true;
    }

    // 요청 객체에서 사용자 정보를 가져오기
    const { user }: { user: UserEntity | CenterEntity } = context
      .switchToHttp()
      .getRequest();
    // 사용자의 역할이 필요한 역할 목록에 포함되는지 권한 확인
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Not a member of the ${user.role} (only ${user.role} can call this api)`,
      );
    }
    return true;
  }
}
