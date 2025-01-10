import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GymEntity } from './entity/gyms.entity';
import { GymsService } from './gyms.service';

@Controller('gyms')
export class GymsController {

  constructor(private readonly gymsService: GymsService){};

  @Get()
  getHello(): string {
    return this.gymsService.getHello();
  }


  @Get('getAll')
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
