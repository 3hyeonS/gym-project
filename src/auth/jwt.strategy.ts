import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserEntity } from './entity/user.entity';
import * as dotenv from 'dotenv';
import { CenterEntity } from './entity/center.entity';

// .env 파일 로드
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(CenterEntity)
    private centersRepository: Repository<CenterEntity>,
  ) {
    // [3] Cookie에 있는 JWT 토큰을 추출
    super({
      secretOrKey: process.env.JWT_SECRET || 'default-secret', // 검증하기 위한 Secret Key
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['Authorization']; // 쿠키에서 JWT 추출
          }
          return token;
        },
      ]),
    });
  } // [4] Secret Key로 검증 - 인스턴스 생성 자체가 Secret Key로 JWT 토큰 검증과정

  // [5] JWT에서 사용자 정보 가져오기(인증)
  async validate(payload) {
    const { signId } = payload;

    const user: UserEntity = await this.usersRepository.findOne({
      where: { signId },
    });

    const center: CenterEntity = user
      ? null
      : await this.centersRepository.findOne({
          where: { signId },
        });

    if (!user && !center) {
      throw new UnauthorizedException();
    }
    return user || center;
  }
}
