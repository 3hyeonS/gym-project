import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SelectedOptionsDto } from './dto/selected-options-dto';
import { allGymDto } from './dto/all-gym-dto';
import { SearchedGymDto } from './dto/searched-gym-dto';
import { ResponseMsg } from 'src/decorators/response-message-decorator';
import { ResponseTransformInterceptor } from 'src/interceptors/response-transform-interceptor';
import { ResponseDto } from '../response-dto';
import { GenericApiResponse } from 'src/decorators/generic-api-response-decorator';
import { PrimitiveApiResponse } from 'src/decorators/primitive-api-response-decorator';

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
    type: 'string',
    example: 'Welcome Gyms',
  })
  @ResponseMsg('문자 출력에 성공')
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
    model: allGymDto,
    isArray: true,
  })
  @ResponseMsg('모든 헬스장 불러오기 성공')
  async getAll() {
    const allGyms = await this.gymsService.getAll();

    return allGyms;
  }

  // 선택 조건에 맞는 헬스장 불러오기
  @Post()
  @ApiOperation({
    summary: '조건에 맞는 헬스장 불러오기',
  })
  @GenericApiResponse({
    status: 201,
    description: '해당 조건의 헬스장 불러오기 성공',
    model: SearchedGymDto,
    isArray: true,
  })
  @ResponseMsg('해당 조건의 헬스장 불러오기 성공')
  async searchSelected(@Body() selectedOptionsDto: SelectedOptionsDto) {
    const searchedGyms =
      await this.gymsService.searchSelected(selectedOptionsDto);
    return searchedGyms;
  }
}
