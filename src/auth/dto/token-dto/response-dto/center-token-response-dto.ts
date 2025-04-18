import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { CenterResponseDto } from '../../center-dto/response-dto/center-response-dto';

export class CenterTokenResponseDto {
  @ApiProperty({ example: 'accessTokenExample' })
  acccessToken: string;

  @ApiProperty({ example: 'refreshTokenExample' })
  refreshToken: string;

  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(CenterResponseDto) }],
  })
  center: CenterResponseDto;
}
