import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GymEntity } from './entity/gyms.entity';
import { GymsService } from './gyms.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SelectedOptionsDto } from './dto/selected-options-dto';
import { allGymDto } from './dto/all-gym-dto';
import { searchedGymDto } from './dto/selected-gym-dto';

@ApiTags('GymsList')
@Controller('gyms')
export class GymsController {

  constructor(private readonly gymsService: GymsService){};

  //문자 출력
  @Get()
  @ApiOperation({
    summary: 'Welcome Gyms 출력',
    description: 'Welcome Gyms 출력' 
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 문자를 출력했습니다.',
    content: {
      'text/plain': { 
        example: 'Welcome Gyms'
      },
    }, 
  })
  // @ApiBearerAuth()
  getHello(): string {
    return this.gymsService.getHello();
  }

  // 모든 헬스장 불러오기
  @Get('getAll')
  @ApiOperation({
    summary: '모든 헬스장 불러오기',
    description: '전체 리스트 출력',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 모든 헬스장을 불러왔습니다.',
    type: allGymDto,
    isArray: true
  }) 
  @ApiResponse({ status: 403, description: '조회에 실패했습니다.' }) 
  getAll(): Promise<GymEntity[]> {
    return this.gymsService.getAll();
  }

  // 선택 조건에 맞는 헬스장 불러오기
  @Post()
  @ApiOperation({
    summary: '조건에 맞는 헬스장 불러오기',
    description: '해당 조건의 헬스장 리스트 출력' 
  })
  @ApiResponse({
    status: 201,
    description: '성공적으로 모든 헬스장을 불러왔습니다.',
    type: searchedGymDto,
    isArray: true
  }) 
  searchSelected(@Body() selectedOptionsDto: SelectedOptionsDto) {
    return this.gymsService.searchSelected(selectedOptionsDto)
  }
}
