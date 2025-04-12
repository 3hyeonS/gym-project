import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      // Authorization 헤더가 없으면 바로 통과 (비회원 접근 허용)
      return true;
    }

    try {
      const result = (await super.canActivate(context)) as boolean;
      // 인증 성공 시 request.user 세팅됨
      await super.logIn?.(request); // optional chaining
      return result;
    } catch (err) {
      // 유효하지 않은 토큰이 들어와도 비회원으로 간주하고 통과시킴
      return true;
    }
  }
}
