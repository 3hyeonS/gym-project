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
    return 'GYMSUpdate';
  }

  async getGym(): Promise<GymEntity[]> {
    const gymList = await this.gymRepository.find()
    return gymList;
  }

  async getObject1(loc: string[]): Promise<GymEntity[]> {
    const objectList = await this.gymRepository
      .createQueryBuilder('gym')
      .where('JSON_CONTAINS(gym.location, :loc) > 0', { loc: JSON.stringify(loc) })
      .getMany();
    return objectList;
  }

  // getObject2(loc: string, wt: string): Promise<GymEntity[]> {
  //   const objectList = this.gymRepository.find({
  //     where: {
  //       location : loc,
  //       workTime : wt
  //     }
  //   })
  //   return objectList;
  // }

  async getObject3(loc: JSON, wt: JSON): Promise<GymEntity[]> {
    const objectList = await this.gymRepository
      .createQueryBuilder('gym')
      .where('JSON_CONTAINS(gym.location, :loc) > 0', { loc: JSON.stringify(loc) })
      .andWhere('JSON_CONTAINS(gym.workTime, :wt) > 0', { wt: JSON.stringify(wt) })
      .getMany();
    return objectList;  
  } 
}
