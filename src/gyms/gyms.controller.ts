import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GymEntity } from './entity/gyms.entity';
import { GymsService } from './gyms.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('GymsList')
@Controller('gyms')
export class GymsController {

  constructor(private readonly gymsService: GymsService){};

  @Get()
  // @ApiBearerAuth()
  getHello(): string {
    return this.gymsService.getHello();
  }


  @Get('getAll')
  @ApiOkResponse({ description: '성공적으로 모든 헬스장을 불러왔습니다.' })
  @ApiOperation({
    summary: '모든 헬스장 불러오기',
    description: '전체 리스트 출력' 
  })
  getAll(): Promise<GymEntity[]> {
    return this.gymsService.getAll();
  }

  @Post()
  searchSelected(
    @Body('flexibleOptions') option: number[],
    @Body('selectedLocation') location: Record<string, string[]>, 
    @Body('selectedWorkType') workType: string[],
    @Body('selectedWorkTime') workTime: string[],
    @Body('selectedWorkDays') workDays: string[],
    @Body('selectedWeekendDuty') weekendDuty: string[],
    @Body('selectedSalary') salary: string[],
    @Body('selectedMaxClassFee') maxClassFee: number,
    @Body('selectedGender') gender: string[],
    @Body('selectedQualifications') qualification: string[],
    @Body('selectedPreference') preference: string[]): 
    Promise<GymEntity[]> {
      return this.gymsService.searchSelected(
        option, location, workType, workTime, workDays, weekendDuty, 
        salary, maxClassFee, gender, qualification, preference
      )
    }
  }
