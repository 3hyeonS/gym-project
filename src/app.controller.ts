import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Welcome 출력',
    description: 'Welcome 출력' 
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 문자를 출력했습니다.',
    content: {
      'text/plain': { 
        example: 'Welcome'
      }
    }
  }) 
  getHello(): string {
    return this.appService.getHello();
  }

}
