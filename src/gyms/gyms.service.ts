import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymEntity } from './entity/gyms.entity';
import { SearchSelectedDto } from './dto/search-gyms-dto';

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
    async searchSelected(searchSelectedDto: SearchSelectedDto): Promise<GymEntity[]> {
        
        const queryBuilder = this.gymRepository.createQueryBuilder('gymsUpdate');
        const conditions: { condition: string; parameters: Record<string, any> }[] = [];
        
        // location 조건 처리
        if (Object.keys(searchSelectedDto.selectedLocation).length > 0) {
            const locConditions: string[] = [];
            const locParameters: Record<string, any> = {};

            let index = 0;
            for (const [city, districts] of Object.entries(searchSelectedDto.selectedLocation)) {
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
        if (searchSelectedDto.selectedWorkType.length > 0) {
            if (searchSelectedDto.flexibleOptions[0] == 1) {
                searchSelectedDto.selectedWorkType.push("명시 안 됨")
                searchSelectedDto.selectedWorkType.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.workType, :wty) > 0',
                parameters: { wty: JSON.stringify(searchSelectedDto.selectedWorkType) }
            });
        }

        // workTime 조건 처리
        if (searchSelectedDto.selectedWorkTime.length > 0) {
            if (searchSelectedDto.flexibleOptions[1] == 1) {
                searchSelectedDto.selectedWorkTime.push("명시 안 됨")
                searchSelectedDto.selectedWorkTime.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.workTime, :wti) > 0',
                parameters: { wti: JSON.stringify(searchSelectedDto.selectedWorkTime) }
            });
        }

        // workDays 조건 처리
        if (searchSelectedDto.selectedWorkDays.length > 0) {
            if (searchSelectedDto.flexibleOptions[2] == 1) {
                searchSelectedDto.selectedWorkDays.push("명시 안 됨")
                searchSelectedDto.selectedWorkDays.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.workDays, :wkd) > 0',
                parameters: { wkd: JSON.stringify(searchSelectedDto.selectedWorkDays) }
            });
        }

        // weekendDuty 조건 처리
        if (searchSelectedDto.selectedWeekendDuty.length > 0) {
            if (searchSelectedDto.flexibleOptions[3] == 1) {
                searchSelectedDto.selectedWeekendDuty.push("명시 안 됨")
                searchSelectedDto.selectedWeekendDuty.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.weekendDuty, :wd) > 0',
                parameters: { wd: JSON.stringify(searchSelectedDto.selectedWeekendDuty) }
            });
        }

        // salary 조건 처리
        if (searchSelectedDto.selectedSalary.length > 0) {
            let slyConditions = [`JSON_CONTAINS(gymsUpdate.salary, :sly) > 0`];
        
            if (searchSelectedDto.flexibleOptions[4] == 1) {
                slyConditions.push(
                    `JSON_CONTAINS(gymsUpdate.salary, '["명시 안 됨"]') > 0`,
                    `JSON_CONTAINS(gymsUpdate.salary, '["채용공고참고"]') > 0`
                );
            }
        
            conditions.push({
                condition: `(${slyConditions.join(' OR ')})`,
                parameters: { sly: JSON.stringify(searchSelectedDto.selectedSalary) }
            });
        }


        // maxClassFee 조건 처리
        if(searchSelectedDto.flexibleOptions[5] == 1) {
            conditions.push({
                condition: '(gymsUpdate.maxClassFee >= :mcf or gymsUpdate.maxClassFee <= -1)',
                parameters: { mcf : searchSelectedDto.selectedMaxClassFee }
            });
        } else {
            conditions.push({
                condition: 'gymsUpdate.maxClassFee >= :mcf',
                parameters: { mcf : searchSelectedDto.selectedMaxClassFee }
            });
        }
        

        // gender 조건 처리
        if (searchSelectedDto.selectedGender.length > 0) {
            if (searchSelectedDto.flexibleOptions[6] == 1) {
                searchSelectedDto.selectedGender.push("명시 안 됨")
                searchSelectedDto.selectedGender.push("성별 무관")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.gender, :gen) > 0',
                parameters: { gen: JSON.stringify(searchSelectedDto.selectedGender) }
            });
        }

        // qualifications 조건 처리
        if (searchSelectedDto.selectedQualifications.length > 0) {
            if (searchSelectedDto.flexibleOptions[7] == 1) {
                searchSelectedDto.selectedQualifications.push("명시 안 됨")
                searchSelectedDto.selectedQualifications.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.qualifications, :qfc) > 0',
                parameters: { qfc: JSON.stringify(searchSelectedDto.selectedQualifications) }
            });
        }

        // preference 조건 처리
        if (searchSelectedDto.selectedPreference.length > 0) {
            if (searchSelectedDto.flexibleOptions[8] == 1) {
                searchSelectedDto.selectedPreference.push("명시 안 됨")
                searchSelectedDto.selectedPreference.push("채용공고참고")
            }
            conditions.push({
                condition: 'JSON_OVERLAPS(gymsUpdate.preference, :pre) > 0',
                parameters: { pre: JSON.stringify(searchSelectedDto.selectedPreference) }
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
