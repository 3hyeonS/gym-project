import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GymEntity } from './entities/gym.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('gym')
  getGym(): Promise<GymEntity[]> {
    return this.appService.getGym();
  }

  @Get('gym/:locations')
  getObject1(@Param('locations') locations: string): Promise<GymEntity[]> {
  // 공백 제거 및 배열 변환
  const parsedLocations = locations.split(',').map(location => location.trim());
  return this.appService.getObject1(parsedLocations);
}

  @Post()
  getObject3(
    @Body('selectedOptions') option: number[],
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
      return this.appService.getObject3(
        option, location, workType, workTime, workDays, weekendDuty, 
        salary, maxClassFee, gender, qualification, preference
      )
    }

}
