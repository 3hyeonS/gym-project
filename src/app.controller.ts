import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
      summary: 'Welcome 출력',
      description: 'Welcome 출력' 
    })
  getHello(): string {
    return this.appService.getHello();
  }

}
