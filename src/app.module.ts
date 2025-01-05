import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymEntity } from './entities/gym.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type:'mysql',
      host:'localhost',
      port:3306,
      username:'root',
      password:'1234',
      database:'gym_db',
      entities:[GymEntity]
    }),
    TypeOrmModule.forFeature([GymEntity])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
