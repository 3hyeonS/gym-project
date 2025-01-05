import { Controller, Get, Param } from '@nestjs/common';
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

  @Get('gym/:location/')
  getObject1(@Param('location')location: string): Promise<GymEntity[]> {
    return this.appService.getObject1(location);
  }

  @Get('gym/:location/:workTime')
  getObject2(@Param('location')location: string, @Param('workTime')workTime: string): Promise<GymEntity[]> {
    return this.appService.getObject2(location, workTime);
  }
 
}
