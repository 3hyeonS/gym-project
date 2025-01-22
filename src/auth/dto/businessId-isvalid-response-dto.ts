import { ApiProperty } from '@nestjs/swagger';

export class BusinessIdIsValidResponseDto {
  @ApiProperty({ example: '000-00-00000' })
  businessId: string;

  @ApiProperty({ example: '계속사업자' })
  businessStatus: string;

  @ApiProperty({ example: '01' })
  businessStatusCode: string;

  @ApiProperty({ example: '부가가치세 일반과세자' })
  taxType: string;

  @ApiProperty({ example: true })
  isValid: boolean;
}
