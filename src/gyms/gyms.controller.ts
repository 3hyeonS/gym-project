import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { GymsService } from './gyms.service';
import {
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
    description: 'Welcome Gyms 출력',
  })
  @PrimitiveApiResponse({
    status: 200,
    description: '문자 출력에 성공했습니다.',
    type: 'string',
    example: 'Welcome',
  })
  @ResponseMsg('성공적으로 문자를 출력했습니다.')
  getHello(): string {
    return this.gymsService.getHello();
  }

  // 모든 헬스장 불러오기
  @Get('getAll')
  @ApiOperation({
    summary: '모든 헬스장 불러오기',
    description: '전체 리스트 출력',
  })
  @GenericApiResponse({
    status: 200,
    description: '성공적으로 모든 헬스장을 불러왔습니다.',
    model: allGymDto,
    isArray: true,
  })
  @ResponseMsg('성공적으로 모든 헬스장을 불러왔습니다.')
  async getAll() {
    const allGyms = await this.gymsService.getAll();

    return allGyms;
  }

  // 선택 조건에 맞는 헬스장 불러오기
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '조건에 맞는 헬스장 불러오기',
    description: '해당 조건의 헬스장 리스트 출력',
  })
  @GenericApiResponse({
    status: 200,
    description: '성공적으로 해당 조건의 헬스장을 불러왔습니다.',
    model: SearchedGymDto,
    isArray: true,
  })
  @ResponseMsg('성공적으로 모든 헬스장을 불러왔습니다.')
  async searchSelected(@Body() selectedOptionsDto: SelectedOptionsDto) {
    const searchedGyms =
      await this.gymsService.searchSelected(selectedOptionsDto);
    return searchedGyms;
  }
}
