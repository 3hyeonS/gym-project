import { ApiProperty } from '@nestjs/swagger';

export class SignIdRequestDto {
  @ApiProperty({
    type: String,
    description: '중복 검사할 signId',
    example: 'sampleid',
  })
  sigId: string;
}
