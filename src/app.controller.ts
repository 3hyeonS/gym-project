import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseTransformInterceptor } from './interceptors/response-transform-interceptor';
import { ResponseMsg } from './decorators/response-message-decorator';

@UseInterceptors(ResponseTransformInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ResponseMsg('성공적으로 문자를 출력했습니다.')
  @ApiOperation({
    summary: 'Welcome App 출력',
    description: 'Welcome App 출력',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 문자를 출력했습니다.',
    content: {
      'application/json': {
        example: {
          message: '성공적으로 문자를 출력했습니다.',
          statusCode: 200,
          data: 'Welcome App',
        },
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
