import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('GYMS API')
    .setDescription('GYMS API 문서입니다.')
    .setVersion('1.0')
    // .addTag('gyms')
    // .addBearerAuth()   #authorization
    // .setTermsOfService('사이트 주소')
    // .setContact('담당자', '사이트 주소', '이메일 주소')
    // .setLicense('라이센스명', '사이트 주소')
    // .addServer('http://localhost:3000/', 'develop')
    // .addServer('http://13.209.47.246:3000/', 'production')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
