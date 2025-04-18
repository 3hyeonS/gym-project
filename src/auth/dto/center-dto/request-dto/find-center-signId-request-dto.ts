import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class FindCenterSignIdRequestDto {
  @ApiProperty({
    type: String,
    description: '대표자 이름',
    example: '홍길동',
  })
  @IsNotEmpty() // null 값 체크
  @IsString()
  @Length(1, 20) // 문자 수
  ceoName: string;

  @ApiProperty({
    type: String,
    description: '사업자 등록 번호(10자리)',
    example: '000-00-00000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{3}-\d{2}-\d{5}$/, {
    message: 'businessId format must be 000-00-00000',
  })
  businessId: string;
}
