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
    @Body('option') option: number[],
    @Body('location') location: Record<string, string[]>, 
    @Body('workType') workType: string[],
    @Body('workTime') workTime: string[],
    @Body('workDays') workDays: string[],
    @Body('weekendDuty') weekendDuty: string[],
    @Body('salary') salary: string[],
    @Body('maxClassFee') maxClassFee: number,
    @Body('gender') gender: string[],
    @Body('qualifications') qualification: string[],
    @Body('preference') preference: string[]): 
    Promise<GymEntity[]> {
      return this.appService.getObject3(
        option, location, workType, workTime, workDays, weekendDuty, 
        salary, maxClassFee, gender, qualification, preference
      )
    }

}
