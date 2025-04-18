import { Injectable, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { VillyEntity } from 'src/recruitment/entity/villy.entity';
import { UserEntity } from 'src/auth/entity/user/user.entity';
import { RecruitmentEntity } from 'src/recruitment/entity/recruitment.entity';

@Injectable()
export class VillySchedulerService implements OnModuleInit {
  constructor(
    @InjectRepository(VillyEntity)
    private readonly villyRepository: Repository<VillyEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RecruitmentEntity)
    private readonly recruitmentRepository: Repository<RecruitmentEntity>,
  ) {}

  onModuleInit() {
    this.scheduleDailyVillyCreation();
  }

  scheduleDailyVillyCreation() {
    // 매일 오후 6시 실행 (한국시간 기준)
    cron.schedule('0 19 * * *', async () => {
      const users = await this.userRepository.find();
      for (const user of users) {
        const recruitment = await this.getMatched(user);
        if (recruitment) {
          await this.villyRepository.save({
            messageType: 0,
            user,
            recruitment,
          });
        }
      }
    });
  }

  // 매칭 알고리즘
  async getMatched(user: UserEntity): Promise<RecruitmentEntity> {
    const resume = user.resume;
    if (!resume) {
      return null;
    }

    // 이미 매칭되었거나 지원한 공고 리스트
    const alreadyVillies = await this.villyRepository.find({
      where: {
        user: { id: user.id },
        messageType: In([0, 1]),
      },
    });

    const alreadyRecruitments = alreadyVillies.map((villy) => {
      return villy.recruitment.id;
    });

    // 성별 조건 1-1
    const conditions1_1: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];
    if (resume.gender == 0) {
      // 남성일 경우
      conditions1_1.push({
        condition: 'recruitment.gender IN (:...gd)',
        parameters: { gd: [1, 2] },
      });
      conditions1_1.push({
        condition: 'NOT JSON_OVERLAPS(recruitment.preference, :pre)',
        parameters: {
          pre: JSON.stringify(['여성']),
        },
      });
    } else {
      // 여성일 경우
      conditions1_1.push({
        condition: 'recruitment.gender IN (:...gd)',
        parameters: { gd: [1, 3] },
      });
      conditions1_1.push({
        condition: 'JSON_OVERLAPS(recruitment.preference, :pre)',
        parameters: {
          pre: JSON.stringify(['여성']),
        },
      });
    }

    // 성별 조건 1-2
    const conditions1_2: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];
    if (resume.gender == 0) {
      // 남성일 경우
      conditions1_2.push({
        condition: 'recruitment.gender IN (:...gd)',
        parameters: { gd: [1, 2] },
      });
    } else {
      // 여성일 경우
      conditions1_2.push({
        condition: 'recruitment.gender IN (:...gd)',
        parameters: { gd: [1, 3] },
      });
    }

    // 지역조건 2-1 (시/도 및 시/군/구 일치)
    const conditions2_1: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];

    const locConditions: string[] = [];
    const locParameters: Record<string, any> = {};

    let index = 0;
    for (const [city, districts] of Object.entries(resume.location)) {
      const cityKey = `city_${index}`;
      const cityAllKeyword = `${city.split(' ')[0]} 전체`; // "{city} 전체" 생성

      if (districts.includes(cityAllKeyword)) {
        locConditions.push(`recruitment.city = :${cityKey}`);
        locParameters[cityKey] = city;
      } else {
        const cityCondition = `recruitment.city = :${cityKey}`;
        const locKeys = districts.map((_, i) => `loc_${index}_${i}`);
        const locConditionsPart = locKeys
          .map((key) => `recruitment.location = :${key}`)
          .join(' OR ');

        locConditions.push(`(${cityCondition} AND (${locConditionsPart}))`);
        locParameters[cityKey] = city;

        districts.forEach((district, i) => {
          locParameters[`loc_${index}_${i}`] = district;
        });
      }
      index++;
    }
    conditions2_1.push({
      condition: `(${locConditions.join(' OR ')})`,
      parameters: locParameters,
    });

    // 지역조건 2-2 (시/도 일치)
    const conditions2_2: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];

    const cityConditions: string[] = [];
    const cityParams: Record<string, any> = {};

    Object.keys(resume.location).forEach((city, index) => {
      const cityKey = `city_${index}`;
      cityConditions.push(`recruitment.city = :${cityKey}`);
      cityParams[cityKey] = city;
    });

    conditions2_2.push({
      condition: `(${cityConditions.join(' OR ')})`,
      parameters: cityParams,
    });

    // 근무시간 조건 3
    const conditions3: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];
    if (resume.workTime) {
      conditions3.push({
        condition: 'JSON_OVERLAPS(recruitment.workTime, :wti) > 0',
        parameters: {
          wti: JSON.stringify(resume.workTime),
        },
      });
    } else {
      conditions3.push({
        condition: '1=1', // 조건 생략용
      });
    }

    // 근무형태 조건 4
    const conditions4: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];
    if (resume.workType) {
      conditions4.push({
        condition: 'JSON_OVERLAPS(recruitment.workType, :wty) > 0',
        parameters: {
          wty: JSON.stringify(resume.workType),
        },
      });
    } else {
      conditions4.push({
        condition: '1=1', // 조건 생략용
      });
    }

    // 경력 조건 5-1
    const conditions5_1: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];
    if (resume.isNew == 0) {
      // 신입일 경우
      conditions5_1.push({
        condition: 'JSON_OVERLAPS(recruitment.qualification, :qlf)',
        parameters: {
          qlf: JSON.stringify(['신입 지원 가능']),
        },
      });
    } else {
      // 경력자일 경우
      conditions5_1.push({
        condition: 'JSON_OVERLAPS(recruitment.preference, :pre)',
        parameters: {
          pre: JSON.stringify(['경력자']),
        },
      });
    }

    // 경력 조건 5-2
    const conditions5_2: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];

    if (resume.isNew == 0) {
      // 신입일 경우
      conditions5_2.push({
        condition: 'NOT JSON_OVERLAPS(recruitment.qualification, :qlf)',
        parameters: {
          qlf: JSON.stringify(['경력자']),
        },
      });
    } else {
      // 경력자일 경우
      conditions5_2.push({
        condition: '1=1', // 조건 생략용
      });
    }

    // 채용 중 여부 처리
    const hiringCondition = {
      condition: 'recruitment.isHiring = :isHiring',
      parameters: { isHiring: 1 },
    };

    // 이미 매칭되었거나 지원한 공고 처리
    const alreadyCondition =
      alreadyRecruitments.length > 0
        ? {
            condition: 'recruitment.id NOT IN (:...excludedIds)',
            parameters: { excludedIds: alreadyRecruitments },
          }
        : {
            condition: '1=1', // 조건 생략용
          };

    const firstMatchingCondition = [
      ...conditions1_1,
      ...conditions2_1,
      ...conditions3,
      ...conditions4,
      ...conditions5_1,
    ];

    const secondMatchingCondition = [
      ...conditions1_2,
      ...conditions2_1,
      ...conditions3,
      ...conditions4,
      ...conditions5_1,
    ];

    const thirdMatchingCondition = [
      ...conditions1_2,
      ...conditions2_1,
      ...conditions3,
      ...conditions4,
      ...conditions5_2,
    ];

    const fourthMatchingCondition = [
      ...conditions1_2,
      ...conditions2_1,
      ...conditions4,
      ...conditions5_2,
    ];

    const fifthMatchingCondition = [
      ...conditions1_2,
      ...conditions2_2,
      ...conditions4,
      ...conditions5_2,
    ];

    const allConditionGroups = [
      firstMatchingCondition,
      secondMatchingCondition,
      thirdMatchingCondition,
      fourthMatchingCondition,
      fifthMatchingCondition,
    ];

    let finalRecruitment: RecruitmentEntity | null = null;

    for (const conditions of allConditionGroups) {
      const qb = this.recruitmentRepository
        .createQueryBuilder('recruitment')
        .leftJoinAndSelect('recruitment.center', 'center')
        .where(hiringCondition.condition, hiringCondition.parameters)
        .andWhere(alreadyCondition.condition, alreadyCondition.parameters);

      conditions.forEach((cond) => {
        qb.andWhere(cond.condition, cond.parameters);
      });

      qb.orderBy('recruitment.date', 'DESC').limit(1);

      const result = await qb.getOne();

      if (result) {
        finalRecruitment = result;
        break; // 결과가 있으면 반복 중단
      }
    }

    return finalRecruitment;
  }
}
