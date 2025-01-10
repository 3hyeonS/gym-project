import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymsModule } from './gyms/gyms.module';
import { GymEntity } from './gyms/entity/gyms.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:'mysql',
      host:'database-1.chusuuo8u7fk.ap-northeast-2.rds.amazonaws.com',
      port:3306,
      username:'admin',
      password:'RDSkey1234',
      database:'gyms',
      entities:[GymEntity]
    }),
    GymsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})  
export class AppModule {}
