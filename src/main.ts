import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './interceptors/logging-interceptor';
import { ValidationPipe } from '@nestjs/common';
// import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

dotenv.config(); // .env 파일 로드

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('GYMS API')
    .setDescription('GYMS API 문서입니다.')
    .setVersion('1.0')
    // .addTag('gyms')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'accessToken',
    )
    // .setTermsOfService('사이트 주소')
    // .setContact('담당자', '사이트 주소', '이메일 주소')
    // .setLicense('라이센스명', '사이트 주소')
    // .addServer('http://13.209.47.246:3000/', 'production')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  ); // 글로벌 ValidationPipe 설정

  SwaggerModule.setup('api', app, documentFactory);

  // // cookie parser 미들웨어 추가
  // app.use(cookieParser());

  // const whitelist = ['http://localhost:3000/'];
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
