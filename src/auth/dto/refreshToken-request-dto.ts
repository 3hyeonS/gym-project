import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenRequestDto {
  @ApiProperty({
    type: String,
    description: '기존 refreshToken',
    example: 'refresTokenExample',
  })
  refreshToken: string;
}
