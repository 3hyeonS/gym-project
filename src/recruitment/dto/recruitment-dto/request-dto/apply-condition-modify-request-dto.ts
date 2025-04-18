import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TGender } from './recruitment-register-request-dto';

export class ApplyConditionModifyRequestDto {
  @ApiProperty({
    enum: TGender,
    description: '성별(성별 무관 or 남성 or 여성)',
    example: TGender.BOTH,
  })
  @IsNotEmpty()
  @IsEnum(TGender, {
    message: 'gender must be 성별 무관, 남성 or 여성 only',
  })
  gender: TGender;

  @ApiProperty({
    type: [String],
    description: '지원자격',
    example: ['신입 지원 가능'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  qualification: string[];

  @ApiProperty({
    type: [String],
    description: '우대사항',
    example: ['경력자', '체육 관련 자격증'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  preference: string[];
}
