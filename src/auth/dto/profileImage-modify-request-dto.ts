import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ProfileImageModifyRequestDto {
  @ApiProperty({
    type: String,
    description: '증명사진 파일 url(100자 이내)',
    example: 'url',
  })
  @IsNotEmpty()
  @Length(1, 100)
  @IsString()
  profileImage: string;
}
