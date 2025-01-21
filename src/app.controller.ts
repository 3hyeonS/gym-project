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

  @ApiOperation({
    summary: 'Welcome App 출력',
  })
  @PrimitiveApiResponse({
    status: 200,
    description: '문자 출력 성공',
    type: 'string',
    example: 'Welcome',
  })
  @ResponseMsg('문자 출력 성공')
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
