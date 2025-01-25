import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { allGymDto } from './dto/all-gym-dto';
import { SearchedGymDto } from './dto/searched-gym-dto';
import { ResponseMsg } from 'src/decorators/response-message-decorator';
import { ResponseTransformInterceptor } from 'src/interceptors/response-transform-interceptor';
import { ResponseDto } from '../response-dto';
import { GenericApiResponse } from 'src/decorators/generic-api-response-decorator';
import { PrimitiveApiResponse } from 'src/decorators/primitive-api-response-decorator';
import { SelectedOptionsDto } from './dto/selected-options-dto';
import { ErrorApiResponse } from 'src/decorators/error-api-response-decorator';

@ApiTags('GymsList')
@UseInterceptors(ResponseTransformInterceptor)
@ApiExtraModels(ResponseDto)
@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  //문자 출력
  @Get()
  @ApiOperation({
    summary: 'Welcome Gyms 출력',
  })
  @PrimitiveApiResponse({
    status: 200,
    description: '문자 출력 성공',
    message: 'String printed successfully',
    type: 'string',
    example: 'Welcome Gyms',
  })
  @ResponseMsg('String printed successfully')
  getHello(): string {
    return this.gymsService.getHello();
  }

  // 모든 헬스장 불러오기
  @Get('getAll')
  @ApiOperation({
    summary: '모든 헬스장 불러오기',
  })
  @GenericApiResponse({
    status: 200,
    description: '모든 헬스장 불러오기 성공',
    message: 'All gyms returned successfully',
    model: allGymDto,
    isArray: true,
  })
  @ResponseMsg('All gyms returned successfully')
  async getAll() {
    const allGyms = await this.gymsService.getAll();

    return allGyms;
  }

  // 선택 조건에 맞는 헬스장 불러오기
  @Post('selected')
  @ApiOperation({
    summary: '조건에 맞는 헬스장 불러오기',
    description: 'body 조건 Schema 클릭해서 각 필드별로 확인',
  })
  @GenericApiResponse({
    status: 201,
    description: '해당 조건의 헬스장 불러오기 성공',
    message: 'Gyms with selected conditions returned successfully',
    model: SearchedGymDto,
    isArray: true,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message:
      'selectedMaxClassFee must be a number conforming to the specified constraints',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 500,
    description:
      'Internal Server Error  \n500은 에러는 에러 내용과 함께 백엔드와 공유',
    message: 'Cannot convert undefined or null to object',
    error: 'TypeError',
  })
  @ResponseMsg('Gyms with selected conditions returned successfully')
  async searchSelected(@Body() selectedOptionsDto: SelectedOptionsDto) {
    const searchedGyms =
      await this.gymsService.searchSelected(selectedOptionsDto);
    return searchedGyms;
  }
}
