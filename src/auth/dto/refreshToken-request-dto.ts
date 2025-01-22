import { ApiProperty } from '@nestjs/swagger';
import { IS_JWT, IsJWT, isJWT } from 'class-validator';

export class RefreshTokenRequestDto {
  @ApiProperty({
    type: String,
    description: '기존 refreshToken',
    example: 'refresTokenExample',
  })
  @IsJWT({ message: 'jwt token 형식이 아닙니다.' })
  refreshToken: string;
}
