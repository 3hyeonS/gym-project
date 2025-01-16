import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<TData> {
  @ApiProperty({ example: '헬스장 불러오기 성공' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  data: TData;
}
