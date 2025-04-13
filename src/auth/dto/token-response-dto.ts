import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { UserResponseDto } from './user-response-dto';
import { CenterResponseDto } from './center-response-dto';

export class TokenResponseDto {
  @ApiProperty({ example: 'accessTokenExample' })
  acccessToken: string;

  @ApiProperty({ example: 'refreshTokenExample' })
  refreshToken: string;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(UserResponseDto) },
      { $ref: getSchemaPath(CenterResponseDto) },
    ],
  })
  member: UserResponseDto | CenterResponseDto;
}
