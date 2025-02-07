import { Module } from '@nestjs/common';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymEntity } from './entity/gyms.entity';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { UserEntity } from 'src/auth/entity/user.entity';
import { RefreshTokenEntity } from 'src/auth/entity/refreshToken.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { KakaoStrategy } from 'src/auth/kakao.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { ExpiredGymEntity } from './entity/expiredGyms.entity';
import { EmailCodeEntity } from 'src/auth/entity/emailCode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GymEntity,
      CenterEntity,
      UserEntity,
      RefreshTokenEntity,
      ExpiredGymEntity,
      EmailCodeEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION,
      },
    }),
    HttpModule,
    AuthModule,
  ],
  exports: [TypeOrmModule, PassportModule, JwtModule],
  controllers: [GymsController],
  providers: [GymsService, JwtStrategy, KakaoStrategy],
})
export class GymsModule {}
