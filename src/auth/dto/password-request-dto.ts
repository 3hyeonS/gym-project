import { ApiProperty } from '@nestjs/swagger';

export class PasswordRequestDto {
  @ApiProperty({
    type: String,
    description: 'password',
    example: 'sample@pw123',
  })
  password: string;
}
