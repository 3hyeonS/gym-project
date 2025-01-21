import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseTransformInterceptor } from './interceptors/response-transform-interceptor';
import { ResponseMsg } from './decorators/response-message-decorator';
import { PrimitiveApiResponse } from './decorators/primitive-api-response-decorator';

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
  @PrimitiveApiResponse({
    status: 200,
    description: '문자 출력에 성공했습니다.',
    type: 'string',
    example: 'Welcome',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
