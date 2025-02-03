import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedOptionsDto } from './dto/selected-options-dto';
import { SearchedGymDto } from './dto/searched-gym-dto';
import { GymEntity } from './entity/gyms.entity';
import { GymResponseDto } from './dto/gym-response-dto';
import { RegisterRequestDto } from './dto/gym-registration-dto';
import { CenterEntity } from 'src/auth/entity/center.entity';
import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

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
    private readonly gymRepository: Repository<GymEntity>,
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
  async getAll(): Promise<GymResponseDto[]> {
    const gymList = await this.gymRepository.find();
    return gymList;
  }

  // method2 : 조건에 맞는 헬스장 리스트 가져오기
  async searchSelected(
    selectedOptionsDto: SelectedOptionsDto,
  ): Promise<SearchedGymDto[]> {
    console.log(selectedOptionsDto);
    const queryBuilder = this.gymRepository.createQueryBuilder('gymsUpdate');
    const conditions: { condition: string; parameters: Record<string, any> }[] =
      [];

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

        if (districts.includes('전체')) {
          locConditions.push(`gymsUpdate.city = :${cityKey}`);
          locParameters[cityKey] = city;
        } else {
          const locKey = `loc_${index}`;
          locConditions.push(
            `(gymsUpdate.city = :${cityKey} AND JSON_OVERLAPS(gymsUpdate.location, :${locKey}))`,
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
        condition: 'JSON_OVERLAPS(gymsUpdate.workType, :wty) > 0',
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
        condition: 'JSON_OVERLAPS(gymsUpdate.workTime, :wti) > 0',
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
        condition: 'JSON_OVERLAPS(gymsUpdate.workDays, :wkd) > 0',
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
        condition: 'JSON_OVERLAPS(gymsUpdate.weekendDuty, :wd) > 0',
        parameters: {
          wd: JSON.stringify(selectedOptionsDto.selectedWeekendDuty),
        },
      });
    }

    // salary 조건 처리
    if (selectedOptionsDto.selectedSalary?.length) {
      let slyConditions = [`JSON_CONTAINS(gymsUpdate.salary, :sly) > 0`];

      if (selectedOptionsDto.flexibleOptions[4] == 1) {
        slyConditions.push(
          `JSON_CONTAINS(gymsUpdate.salary, '["명시 안 됨"]') > 0`,
          `JSON_CONTAINS(gymsUpdate.salary, '["채용공고참고"]') > 0`,
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
            '(gymsUpdate.maxClassFee >= :mcf or gymsUpdate.maxClassFee <= -1)',
          parameters: { mcf: selectedOptionsDto.selectedMaxClassFee },
        });
      } else {
        conditions.push({
          condition: 'gymsUpdate.maxClassFee >= :mcf',
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
        condition: 'JSON_OVERLAPS(gymsUpdate.gender, :gen) > 0',
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
        condition: 'JSON_OVERLAPS(gymsUpdate.qualifications, :qfc) > 0',
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
        condition: 'JSON_OVERLAPS(gymsUpdate.preference, :pre) > 0',
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
    const objectList = await queryBuilder.getMany();
    return objectList;
  }

  // method3: 헬스장 공고 등록하기
  async register(
    center: CenterEntity,
    registerRequestDto: RegisterRequestDto,
    files?: Express.Multer.File[],
  ) {
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
    } = registerRequestDto;

    const centerName = center.centerName;
    const address = this.extractLocation(center.address);
    const maxClassFee = classFee ? classFee[1] : -2;

    // 이미지 업로드 후 URL 리스트 가져오기
    const imageUrls = await this.uploadGymImages(files || []);

    const newGym = this.gymRepository.create({
      centerName: centerName,
      city: (await address).city,
      location: (await address).location,
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
      image: imageUrls, // 이미지 URL 저장
    });

    const savedGym = await this.gymRepository.save(newGym);
    return savedGym;
  }

  // 주소에서 시/도, 시/군/구 추출
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
      /([가-힣]+(시|구|군)\s?[가-힣]*(구|군)?)/,
    );

    if (!locationMatch) {
      throw new BadRequestException(
        'Invalid address: 시/군/구 정보를 찾을 수 없습니다.',
      );
    }
    const location = [locationMatch[0].trim()];

    return { city, location };
  }

  // method4: 내 공고 불러오기
  async getMyGym(center: CenterEntity): Promise<GymResponseDto[]> {
    const myGym = await this.gymRepository.find({
      where: { center },
    });
    return myGym;
  }

  // method5: 내 공고 수정하기
  async modifyMyGym(id: number, registerRequestDto: RegisterRequestDto) {
    await this.gymRepository.update(id, registerRequestDto);
    const updatedGym = await this.gymRepository.findOne({ where: { id } });

    return updatedGym;
  }

  // 📌 다중 이미지 S3 업로드
  async uploadGymImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map(async (file) => {
      const fileKey = `gyms/${uuidv4()}-${file.originalname}`;

      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: ObjectCannedACL.public_read, // 퍼블릭 읽기 권한
      };

      await this.s3.send(new PutObjectCommand(params));
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    });

    return Promise.all(uploadPromises);
  }
}
