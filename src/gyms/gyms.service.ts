import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedOptionsDto } from './dto/selected-options-dto';
import { GymEntity } from './entity/gyms.entity';
import { GymResponseDto } from './dto/gym-response-dto';
import { GymRegisterRequestDto } from './dto/gym-registration-request-dto';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ExpiredGymEntity } from './entity/expiredGyms.entity';

@Injectable()
export class GymsService {
  //문자 출력
  getHello(): string {
    return 'Welcome Gyms';
  }

  private s3: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(GymEntity)
    private gymRepository: Repository<GymEntity>,
    @InjectRepository(ExpiredGymEntity)
    private expiredGymRepository: Repository<ExpiredGymEntity>,
    @InjectRepository(CenterEntity)
    private centerRepository: Repository<CenterEntity>,
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  // method1 : 모든 헬스장 리스트 가져오기
  async getAll(
    page: number,
    limit: number,
  ): Promise<{
    gymList: GymResponseDto[];
    totalGyms: number;
    totalPages: number;
    page: number;
  }> {
    const [gymList, totalCount] = await this.gymRepository.findAndCount({
      order: { date: 'DESC' }, // 최신순 정렬
      take: limit, // 한 페이지에 보여줄 개수
      skip: (page - 1) * limit, // 페이지 계산
      relations: ['center'],
    });
    return {
      gymList: gymList.map((gym) => new GymResponseDto(gym)),
      page,
      totalGyms: totalCount, // 전체 헬스장 수
      totalPages: Math.ceil(totalCount / limit), // 총 페이지 수
    };
  }

  // method2 : 조건에 맞는 헬스장 리스트 가져오기
  async searchSelected(
    selectedOptionsDto: SelectedOptionsDto,
    page: number,
    limit: number,
  ): Promise<{
    gymList: GymResponseDto[];
    totalGyms: number;
    totalPages: number;
    page: number;
  }> {
    const queryBuilder = this.gymRepository
      .createQueryBuilder('gymList')
      .leftJoinAndSelect('gymList.center', 'center');
    const conditions: { condition: string; parameters: Record<string, any> }[] =
      [];

    // centerName 조건 처리
    if (
      selectedOptionsDto.selectedName &&
      selectedOptionsDto.selectedName.trim() !== ''
    ) {
      conditions.push({
        condition: 'gymList.centerName LIKE :name',
        parameters: {
          name: `%${selectedOptionsDto.selectedName}%`, // 부분 검색 (포함 여부 확인)
        },
      });
    }

    // location 조건 처리
    if (
      selectedOptionsDto.selectedLocation &&
      Object.keys(selectedOptionsDto.selectedLocation)?.length
    ) {
      const locConditions: string[] = [];
      const locParameters: Record<string, any> = {};

      let index = 0;
      for (const [city, districts] of Object.entries(
        selectedOptionsDto.selectedLocation,
      )) {
        const cityKey = `city_${index}`;
        const cityAllKeyword = `${city.split(' ')[0]} 전체`; // "{city} 전체" 생성

        if (districts.includes(cityAllKeyword)) {
          locConditions.push(`gymList.city = :${cityKey}`);
          locParameters[cityKey] = city;
        } else {
          const locKey = `loc_${index}`;
          locConditions.push(
            `(gymList.city = :${cityKey} AND JSON_OVERLAPS(gymList.location, :${locKey}))`,
          );
          locParameters[cityKey] = city;
          locParameters[locKey] = JSON.stringify(districts);
        }
        index++;
      }

      conditions.push({
        condition: `(${locConditions.join(' OR ')})`,
        parameters: locParameters,
      });
    }

    // workType 조건 처리
    if (selectedOptionsDto.selectedWorkType?.length) {
      if (selectedOptionsDto.flexibleOptions[0] == 1) {
        selectedOptionsDto.selectedWorkType.push('명시 안 됨');
        selectedOptionsDto.selectedWorkType.push('채용공고참고');
      }
      conditions.push({
        condition: 'JSON_OVERLAPS(gymList.workType, :wty) > 0',
        parameters: {
          wty: JSON.stringify(selectedOptionsDto.selectedWorkType),
        },
      });
    }

    // workTime 조건 처리
    if (selectedOptionsDto.selectedWorkTime?.length) {
      if (selectedOptionsDto.flexibleOptions[1] == 1) {
        selectedOptionsDto.selectedWorkTime.push('명시 안 됨');
        selectedOptionsDto.selectedWorkTime.push('채용공고참고');
      }
      conditions.push({
        condition: 'JSON_OVERLAPS(gymList.workTime, :wti) > 0',
        parameters: {
          wti: JSON.stringify(selectedOptionsDto.selectedWorkTime),
        },
      });
    }

    // workDays 조건 처리
    if (selectedOptionsDto.selectedWorkDays?.length) {
      if (selectedOptionsDto.flexibleOptions[2] == 1) {
        selectedOptionsDto.selectedWorkDays.push('명시 안 됨');
        selectedOptionsDto.selectedWorkDays.push('채용공고참고');
      }
      conditions.push({
        condition: 'JSON_OVERLAPS(gymList.workDays, :wkd) > 0',
        parameters: {
          wkd: JSON.stringify(selectedOptionsDto.selectedWorkDays),
        },
      });
    }

    // weekendDuty 조건 처리
    if (selectedOptionsDto.selectedWeekendDuty?.length) {
      if (selectedOptionsDto.flexibleOptions[3] == 1) {
        selectedOptionsDto.selectedWeekendDuty.push('명시 안 됨');
        selectedOptionsDto.selectedWeekendDuty.push('채용공고참고');
      }
      conditions.push({
        condition: 'JSON_OVERLAPS(gymList.weekendDuty, :wd) > 0',
        parameters: {
          wd: JSON.stringify(selectedOptionsDto.selectedWeekendDuty),
        },
      });
    }

    // salary 조건 처리
    if (selectedOptionsDto.selectedSalary?.length) {
      let slyConditions = [`JSON_CONTAINS(gymList.salary, :sly) > 0`];

      if (selectedOptionsDto.flexibleOptions[4] == 1) {
        slyConditions.push(
          `JSON_CONTAINS(gymList.salary, '["명시 안 됨"]') > 0`,
          `JSON_CONTAINS(gymList.salary, '["채용공고참고"]') > 0`,
        );
      }

      conditions.push({
        condition: `(${slyConditions.join(' OR ')})`,
        parameters: { sly: JSON.stringify(selectedOptionsDto.selectedSalary) },
      });
    }

    // maxClassFee 조건 처리
    if (selectedOptionsDto.selectedMaxClassFee) {
      if (selectedOptionsDto.flexibleOptions[5] == 1) {
        conditions.push({
          condition:
            '(gymList.maxClassFee >= :mcf or gymList.maxClassFee <= -1)',
          parameters: { mcf: selectedOptionsDto.selectedMaxClassFee },
        });
      } else {
        conditions.push({
          condition: 'gymList.maxClassFee >= :mcf',
          parameters: { mcf: selectedOptionsDto.selectedMaxClassFee },
        });
      }
    }

    // gender 조건 처리
    if (selectedOptionsDto.selectedGender?.length) {
      if (selectedOptionsDto.flexibleOptions[6] == 1) {
        selectedOptionsDto.selectedGender.push('명시 안 됨');
        selectedOptionsDto.selectedGender.push('성별 무관');
      }
      conditions.push({
        condition: 'JSON_OVERLAPS(gymList.gender, :gen) > 0',
        parameters: { gen: JSON.stringify(selectedOptionsDto.selectedGender) },
      });
    }

    // qualifications 조건 처리
    if (selectedOptionsDto.selectedQualifications?.length) {
      if (selectedOptionsDto.flexibleOptions[7] == 1) {
        selectedOptionsDto.selectedQualifications.push('명시 안 됨');
        selectedOptionsDto.selectedQualifications.push('채용공고참고');
      }
      conditions.push({
        condition: 'JSON_OVERLAPS(gymList.qualifications, :qfc) > 0',
        parameters: {
          qfc: JSON.stringify(selectedOptionsDto.selectedQualifications),
        },
      });
    }

    // preference 조건 처리
    if (selectedOptionsDto.selectedPreference?.length) {
      if (selectedOptionsDto.flexibleOptions[8] == 1) {
        selectedOptionsDto.selectedPreference.push('명시 안 됨');
        selectedOptionsDto.selectedPreference.push('채용공고참고');
      }
      conditions.push({
        condition: 'JSON_OVERLAPS(gymList.preference, :pre) > 0',
        parameters: {
          pre: JSON.stringify(selectedOptionsDto.selectedPreference),
        },
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

    // date 내림차순 정렬 추가
    queryBuilder.orderBy('gymList.date', 'DESC');

    // 총 개수 가져오기
    const totalCount = await queryBuilder.getCount();

    // 페이징 처리
    queryBuilder.take(limit).skip((page - 1) * limit);

    // 최종 데이터 가져오기
    const objectList = await queryBuilder.getMany();

    return {
      gymList: objectList.map((gym) => new GymResponseDto(gym)),
      page,
      totalGyms: totalCount, // 전체 헬스장 수
      totalPages: Math.ceil(totalCount / limit), // 총 페이지 수
    };
  }

  // 채용 공고 등록 가능 여부 확인
  async canRegister(center: CenterEntity): Promise<boolean> {
    const myGym = await this.gymRepository.findOneBy({ center });
    if (myGym) {
      return false;
    }
    return true;
  }

  // method3: 헬스장 공고 등록하기
  async register(
    center: CenterEntity,
    registerRequestDto: GymRegisterRequestDto,
  ): Promise<GymResponseDto> {
    if (!(await this.canRegister(center))) {
      throw new ForbiddenException('Your hiring recruitment already exists');
    }
    const {
      workType,
      workTime,
      workDays,
      weekendDuty,
      salary,
      basePay,
      classPay,
      classFee,
      hourly,
      monthly,
      gender,
      qualifications,
      preference,
      description,
      image,
      apply,
    } = registerRequestDto;

    const centerName = center.centerName;
    const address = await this.extractLocation(center.address);
    const maxClassFee = classFee ? classFee[1] : -2;

    const newGym = this.gymRepository.create({
      centerName: centerName,
      city: address.city,
      location: address.location,
      subway: null,
      workType,
      workTime,
      workDays,
      weekendDuty,
      salary,
      basePay,
      classPay,
      classFee,
      hourly,
      monthly,
      maxClassFee: maxClassFee,
      gender,
      qualifications,
      preference,
      site: ['직접 등록'],
      date: new Date(),
      description,
      center: center,
      image, // 이미지 URL 저장
      apply,
    });

    const savedGym = await this.gymRepository.save(newGym);
    return new GymResponseDto(savedGym);
  }

  // method4: 주소에서 시/도, 시/군/구 추출
  async extractLocation(
    address: string,
  ): Promise<{ city: string; location: string[] }> {
    // 시/도 추출 (서울특별시, 서울시, 경기도 등)
    const cityMatch = address.match(/^([가-힣]+)(?=\s)/);
    if (!cityMatch) {
      throw new BadRequestException(
        'Invalid address: 시/도 정보를 찾을 수 없습니다.',
      );
    }
    let city = cityMatch[0];

    // 시/군/구 추출
    const addressWithoutcity = address.replace(cityMatch[0], '').trim();
    const locationMatch = addressWithoutcity.match(
      /([가-힣]+(시|구|군)\s?[가-힣]+(구|군)?)/,
    );

    if (!locationMatch) {
      throw new BadRequestException(
        'Invalid address: 시/군/구 정보를 찾을 수 없습니다.',
      );
    }
    const location = [locationMatch[0].trim()];

    return { city, location };
  }

  // method5: 내 채용 중 공고 불러오기
  async getMyGym(center: CenterEntity): Promise<GymResponseDto | null> {
    const myGym = await this.gymRepository.findOne({
      where: { center },
      relations: ['center'], // center 관계를 로드
    });
    if (!myGym) {
      return null;
    }
    return new GymResponseDto(myGym);
  }

  // method6: 내 만료된 공고 불러오기
  async getMyExpiredGyms(center: CenterEntity): Promise<GymResponseDto[]> {
    const myExpiredGyms = await this.expiredGymRepository.find({
      where: { center },
      relations: ['center'], // center 관계를 로드
    });
    return myExpiredGyms.map((gym) => new GymResponseDto(gym));
  }

  // method7: 내 채용 중 공고 끌어올리기
  async refreshMyGym(center: CenterEntity): Promise<GymResponseDto> {
    const myGym = await this.gymRepository.findOneBy({ center });
    if (!myGym) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    // 하루에 한 번만
    const date = myGym.date;
    if (new Date(date).getDate() == new Date().getDate()) {
      throw new ForbiddenException('You already updated recruitment today');
    }
    await this.gymRepository.update(
      { center },
      {
        date: new Date(),
      },
    );
    const myRefreshedGym = await this.gymRepository.findOneBy({ center });
    return new GymResponseDto(myRefreshedGym);
  }

  // method8: 내 채용 중 공고 만료시키기
  async expireMyGym(center: CenterEntity): Promise<void> {
    const myGym = await this.gymRepository.findOneBy({ center });
    if (!myGym) {
      throw new NotFoundException('There is no hring recruitment');
    }
    const { id, ...gymData } = myGym;
    const expiredGym = this.expiredGymRepository.create({
      ...gymData, // 기존 데이터 복사
      center,
    });
    await this.expiredGymRepository.save(expiredGym);
    await this.deleteMyGym(center);
  }

  // method9: 내 채용 중 공고 삭제하기
  async deleteMyGym(center: CenterEntity): Promise<void> {
    const myGym = await this.gymRepository.findOneBy({ center });
    if (!myGym) {
      throw new NotFoundException('There is no hiring recruitment');
    }
    await this.gymRepository.delete({ center });
  }

  // method10: 내 만료된 공고 삭제하기
  async deleteMyExpiredGym(id: number): Promise<void> {
    const myGym = await this.expiredGymRepository.findOneBy({ id });
    if (!myGym) {
      throw new NotFoundException(
        'There is no expired recruitment for selected id',
      );
    }
    await this.expiredGymRepository.delete({ id });
  }

  // method11: 내 채용 중 공고 수정하기
  async modifyMyGym(
    center: CenterEntity,
    registerRequestDto: GymRegisterRequestDto,
  ): Promise<GymResponseDto> {
    const myGym = await this.gymRepository.findOneBy({ center });
    if (!myGym) {
      throw new NotFoundException('There is no hiring recruitment');
    }
    await this.gymRepository.update(myGym.id, {
      ...registerRequestDto,
    });
    const updatedGym = await this.gymRepository.findOne({
      where: { id: myGym.id },
    });

    return new GymResponseDto(updatedGym);
  }

  // method12: 다중 이미지 S3 업로드
  async uploadImages(
    centerName: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }
    const uploadPromises = files.map(async (file) => {
      const fileKey = `images/${centerName}-register/${file.originalname}`;

      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await this.s3.send(new PutObjectCommand(params));
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    });

    return Promise.all(uploadPromises);
  }
}
