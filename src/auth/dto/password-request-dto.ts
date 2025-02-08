import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PasswordRequestDto {
  @ApiProperty({
    type: String,
    description: 'password',
    example: 'sample@pw123',
  })
  @IsNotEmpty()
  password: string;
}
