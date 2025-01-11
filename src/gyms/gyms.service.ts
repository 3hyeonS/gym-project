import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymEntity } from './entity/gyms.entity';

@Injectable()
export class GymsService {
    getHello(): string {
        return 'Welcome Gyms';
    }

    constructor(
        @InjectRepository(GymEntity)
        private readonly gymRepository:Repository<GymEntity>
    ){}
    
    // method1 : 모든 헬스장 리스트 가져오기
    async getAll(): Promise<GymEntity[]> {
        const gymList = await this.gymRepository.find()
        return gymList;
    }
    
    // method2 : 조건에 맞는 헬스장 리스트 가져오기
    async searchSelected(
    opt:number[], loc: Record<string, string[]>, wty: string[], wti: string[], wkd: string[],
    wd: string[], sly: string[], mcf: number, gen: string[], qfc: string[], pre: string[]
    ): Promise<GymEntity[]> {
    
        const queryBuilder = this.gymRepository.createQueryBuilder('gymsUpdate');
        const conditions: { condition: string; parameters: Record<string, any> }[] = [];
        
        // location 조건 처리
        if (Object.keys(loc).length > 0) {
            const locConditions: string[] = [];
            const locParameters: Record<string, any> = {};

            let index = 0;
            for (const [city, districts] of Object.entries(loc)) {
                const cityKey = `city_${index}`;
                
                if (districts.includes("전체")) {
                    locConditions.push(`gymsUpdate.city = :${cityKey}`);
                    locParameters[cityKey] = city;
                } else {
                    const locKey = `loc_${index}`;
                    locConditions.push(
                        `(gymsUpdate.city = :${cityKey} AND JSON_OVERLAPS(gymsUpdate.location, :${locKey}))`
                    );
                    locParameters[cityKey] = city;
                    locParameters[locKey] = JSON.stringify(districts);
                }
                index++;
            }

            conditions.push({
                condition: `(${locConditions.join(' OR ')})`,
                parameters: locParameters
            });
        }

        // workType 조건 처리
        if (wty.length > 0) {
            if (opt[0] == 1) {
                wty.push("명시 안 됨")
                wty.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.workType, :wty) > 0',
                parameters: { wty: JSON.stringify(wty) }
            });
        }

        // workTime 조건 처리
        if (wti.length > 0) {
            if (opt[1] == 1) {
                wti.push("명시 안 됨")
                wti.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.workTime, :wti) > 0',
                parameters: { wti: JSON.stringify(wti) }
            });
        }

        // workDays 조건 처리
        if (wkd.length > 0) {
            if (opt[2] == 1) {
                wkd.push("명시 안 됨")
                wkd.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.workDays, :wkd) > 0',
                parameters: { wkd: JSON.stringify(wkd) }
            });
        }

        // weekendDuty 조건 처리
        if (wd.length > 0) {
            if (opt[3] == 1) {
                wd.push("명시 안 됨")
                wd.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.weekendDuty, :wd) > 0',
                parameters: { wd: JSON.stringify(wd) }
            });
        }

        // salary 조건 처리
        if (sly.length > 0) {
            let slyConditions = [`JSON_CONTAINS(gymsUpdate.salary, :sly) > 0`];
        
            if (opt[4] == 1) {
                slyConditions.push(
                    `JSON_CONTAINS(gymsUpdate.salary, '["명시 안 됨"]') > 0`,
                    `JSON_CONTAINS(gymsUpdate.salary, '["채용공고참고"]') > 0`
                );
            }
        
            conditions.push({
                condition: `(${slyConditions.join(' OR ')})`,
                parameters: { sly: JSON.stringify(sly) }
            });
        }


        // maxClassFee 조건 처리
        if(opt[5] == 1) {
            conditions.push({
                condition: '(gymsUpdate.maxClassFee >= :mcf or gymsUpdate.maxClassFee <= -1)',
                parameters: { mcf : mcf }
            });
        } else {
            conditions.push({
                condition: 'gymsUpdate.maxClassFee >= :mcf',
                parameters: { mcf : mcf }
            });
        }
        

        // gender 조건 처리
        if (gen.length > 0) {
            if (opt[6] == 1) {
                gen.push("명시 안 됨")
                gen.push("성별 무관")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.gender, :gen) > 0',
                parameters: { gen: JSON.stringify(gen) }
            });
        }

        // qualifications 조건 처리
        if (qfc.length > 0) {
            if (opt[7] == 1) {
                qfc.push("명시 안 됨")
                qfc.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.qualifications, :qfc) > 0',
                parameters: { qfc: JSON.stringify(qfc) }
            });
        }

        // preference 조건 처리
        if (pre.length > 0) {
            if (opt[8] == 1) {
                pre.push("명시 안 됨")
                pre.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.preference, :pre) > 0',
                parameters: { pre: JSON.stringify(pre) }
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
