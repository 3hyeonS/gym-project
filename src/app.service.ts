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
    return 'GymsUpdate';
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

  
  async getObject3(
    opt:number[], loc: Record<string, string[]>, wty: string[], wti: string[], wkd: string[],
    wd: string[], sly: string[], mcf: number, gen: string[], qfc: string[], pre: string[]
  ): Promise<GymEntity[]> {
    
    const queryBuilder = this.gymRepository.createQueryBuilder('gym');
    const conditions: { condition: string; parameters: Record<string, any> }[] = [];
    
    // loc 조건 처리
    if (Object.keys(loc).length > 0) {
      const locConditions: string[] = [];
      const locParameters: Record<string, any> = {};

      let index = 0;
      for (const [city, districts] of Object.entries(loc)) {
        const cityKey = `city_${index}`;
        const locKey = `loc_${index}`;
        
        locConditions.push(
          `(gym.city = :${cityKey} AND JSON_OVERLAPS(gym.location, :${locKey}))`
        );
        locParameters[cityKey] = city;
        locParameters[locKey] = JSON.stringify(districts);
        index++;
      }

      conditions.push({
        condition: `(${locConditions.join(' OR ')})`,
        parameters: locParameters,
      });
    }

    if (wty.length > 0) {
      if (opt[0] == 1)
        wty.push("명시 안 됨")
        wty.push("채용공고참고")
      conditions.push({
        condition: 'JSON_OVERLAPS(gym.workType, :wty) > 0',
        parameters: { wty: JSON.stringify(wty) },
      });
    }

    if (wti.length > 0) {
      if (opt[1] == 1)
        wti.push("명시 안 됨")
        wti.push("채용공고참고")
      conditions.push({
        condition: 'JSON_OVERLAPS(gym.workTime, :wti) > 0',
        parameters: { wti: JSON.stringify(wti) },
      });
    }

    if (wkd.length > 0) {
      if (opt[2] == 1)
        wkd.push("명시 안 됨")
        wkd.push("채용공고참고")
      conditions.push({
        condition: 'JSON_OVERLAPS(gym.workDays, :wkd) > 0',
        parameters: { wkd: JSON.stringify(wkd) },
      });
    }

    if (wd.length > 0) {
      if (opt[3] == 1)
        wd.push("명시 안 됨")
        wd.push("채용공고참고")
      conditions.push({
        condition: 'JSON_OVERLAPS(gym.weekendDuty, :wd) > 0',
        parameters: { wd: JSON.stringify(wd) },
      });
    }

    if (sly.length > 0) {
      let slyConditions = [`JSON_CONTAINS(gym.salary, :sly) > 0`];
    
      if (opt[4] == 1) {
        slyConditions.push(
          `JSON_CONTAINS(gym.salary, '["명시 안 됨"]') > 0`,
          `JSON_CONTAINS(gym.salary, '["채용공고참고"]') > 0`
        );
      }
    
      conditions.push({
        condition: `(${slyConditions.join(' OR ')})`,
        parameters: { sly: JSON.stringify(sly) },
      });
    }

    if(opt[5] == 1) {
      conditions.push({
        condition: '(gym.maxClassFee >= :mcf or gym.maxClassFee <= -1)',
        parameters: { mcf : mcf},
      });
    } else {
      conditions.push({
        condition: 'gym.maxClassFee >= :mcf',
        parameters: { mcf : mcf},
      });
    }
    

    if (gen.length > 0) {
      if (opt[6] == 1)
        gen.push("명시 안 됨")
        gen.push("성별 무관")
      conditions.push({
        condition: 'JSON_OVERLAPS(gym.gender, :gen) > 0',
        parameters: { gen: JSON.stringify(gen) },
      });
    }

    if (qfc.length > 0) {
      console.log(opt[7])
      if (opt[7] == 1)
        qfc.push("명시 안 됨")
        qfc.push("채용공고참고")
      console.log(qfc)
      conditions.push({
        condition: 'JSON_OVERLAPS(gym.qualifications, :qfc) > 0',
        parameters: { qfc: JSON.stringify(qfc) },
      });
    }

    if (pre.length > 0) {
      if (opt[8] == 1)
        pre.push("명시 안 됨")
        pre.push("채용공고참고")
      conditions.push({
        condition: 'JSON_OVERLAPS(gym.preference, :pre) > 0',
        parameters: { pre: JSON.stringify(pre) },
      });
    }


    // 쿼리 빌더에 조건 추가
    conditions.forEach((condition, index) => {
      if (index === 0) {
        queryBuilder.where(condition.condition, condition.parameters);
      } else {
        queryBuilder.andWhere(condition.condition, condition.parameters);
      }
    });

    const objectList = await queryBuilder.getMany();
    return objectList;

  }
  
}
