import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymEntity } from './entities/gym.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(GymEntity)
    private readonly gymRepository:Repository<GymEntity>
  ){}

  getHello(): string {
    return 'Hello World!';
  }

  async getGym(): Promise<GymEntity[]> {
    const gymList = await this.gymRepository.find()
    return gymList;
  }

  getObject1(loc: string): Promise<GymEntity[]> {
    const objectList = this.gymRepository.find({
      where: {
        location : loc
      }
    })
    return objectList;
  }

  getObject2(loc: string, wt: string): Promise<GymEntity[]> {
    const objectList = this.gymRepository.find({
      where: {
        location : loc,
        workTime : wt
      }
    })
    return objectList;
  }
}
