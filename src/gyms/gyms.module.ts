import { Module } from '@nestjs/common';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymEntity } from './entity/gyms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GymEntity])],
  exports: [TypeOrmModule],
  controllers: [GymsController],
  providers: [GymsService],
})
export class GymsModule {}
