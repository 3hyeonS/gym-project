import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SelectedOptionsDto } from './dto/selected-options-dto';
import { RecruitmentEntity } from './entity/recruitment.entity';
import { RecruitmentResponseDto } from './dto/recruitment-response-dto';
import {
  RecruitmentRegisterRequestDto,
  TGender,
  TWeekendDuty,
} from './dto/recruitment-registration-request-dto';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ExpiredRecruitmentEntity } from './entity/expiredRecruitment.entity';
import { WeekendDutyModifyRequestDto } from './dto/weekendDuty-modify-request-dto';
import { ApplyConditionModifyRequestDto } from './dto/apply-condition-modify-request-dto';
import { SalaryCondtionModifyRequestDto } from './dto/salary-condition-modify-request-dto';
import { ApplyModifyRequestDto } from './dto/apply-modify-request-dto';
import { DetailModifyRequestDto } from './dto/detail-modify-request-dto';
import { UserEntity } from 'src/auth/entity/user.entity';
import { BookmarkEntity } from './entity/bookmark.entity';

@Injectable()
export class RecruitmentService {
  //문자 출력
  getHello(): string {
    return 'Welcome Recruitment';
  }

  private s3: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(RecruitmentEntity)
    private recruitmentRepository: Repository<RecruitmentEntity>,
    @InjectRepository(ExpiredRecruitmentEntity)
    private expiredRecruitmentRepository: Repository<ExpiredRecruitmentEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CenterEntity)
    private centerRepository: Repository<CenterEntity>,
    @InjectRepository(BookmarkEntity)
    private bookmarkRepository: Repository<BookmarkEntity>,
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

  // method0 : 공고 총 개수 가져오기
  async getTotalNumber(): Promise<number> {
    return await this.recruitmentRepository.count();
  }

  // method1 : 모든 공고 가져오기
  async getAll(
    page: number,
    limit: number,
  ): Promise<{
    recruitmentsList: RecruitmentResponseDto[];
    page: number;
    totalRecruitments: number;
    totalPages: number;
  }> {
    const [recruitmentsList, totalCount] =
      await this.recruitmentRepository.findAndCount({
        order: { date: 'DESC' }, // 최신순 정렬
        take: limit, // 한 페이지에 보여줄 개수
        skip: (page - 1) * limit, // 페이지 계산
        relations: ['center'],
      });
    return {
      recruitmentsList: recruitmentsList.map(
        (recruitment) => new RecruitmentResponseDto(recruitment),
      ),
      page,
      totalRecruitments: totalCount, // 전체 헬스장 수
      totalPages: Math.ceil(totalCount / limit), // 총 페이지 수
    };
  }

  // method2 : 조건에 맞는 헬스장 리스트 가져오기
  async searchSelected(
    selectedOptionsDto: SelectedOptionsDto,
    page: number,
    limit: number,
  ): Promise<{
    recruitmentsList: RecruitmentResponseDto[];
    page: number;
    totalRecruitments: number;
    totalPages: number;
  }> {
    const queryBuilder = this.recruitmentRepository
      .createQueryBuilder('recruitment')
      .leftJoinAndSelect('recruitment.center', 'center');
    const conditions: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];

    // centerName 조건 처리
    if (
      selectedOptionsDto.selectedName &&
      selectedOptionsDto.selectedName.trim() !== ''
    ) {
      conditions.push({
        condition: 'recruitment.centerName LIKE :name',
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
        condition: 'JSON_OVERLAPS(recruitment.workType, :wty) > 0',
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
        condition: 'JSON_OVERLAPS(recruitment.workTime, :wti) > 0',
        parameters: {
          wti: JSON.stringify(selectedOptionsDto.selectedWorkTime),
        },
      });
    }

    // weekendDuty 조건 처리
    if (selectedOptionsDto.selectedWeekendDuty?.length) {
      if (selectedOptionsDto.flexibleOptions[2] == 1) {
        selectedOptionsDto.selectedWeekendDuty.push('명시 안 됨');
        selectedOptionsDto.selectedWeekendDuty.push('채용공고참고');
      }
      const weekendDutyMap = {
        ['명시 안 됨']: 0,
        ['있음']: 1,
        ['없음']: 2,
        ['채용 공고 참고']: 3,
      };
      const transformedWeekendDuty: number[] = [];
      selectedOptionsDto.selectedWeekendDuty.forEach((option) => {
        transformedWeekendDuty.push(weekendDutyMap[option]);
      });
      conditions.push({
        condition: 'recruitment.weekendDuty IN (:...wd)',
        parameters: { wd: transformedWeekendDuty },
      });
    }

    // gender 조건 처리
    if (selectedOptionsDto.selectedGender?.length) {
      if (selectedOptionsDto.flexibleOptions[3] == 1) {
        selectedOptionsDto.selectedGender.push('명시 안 됨');
        selectedOptionsDto.selectedGender.push('성별 무관');
      }
      const genderMap = {
        ['명시 안 됨']: 0,
        ['성별 무관']: 1,
        ['남성']: 2,
        ['여성']: 3,
      };
      const transformedGender: number[] = [];
      selectedOptionsDto.selectedGender.forEach((option) => {
        transformedGender.push(genderMap[option]);
      });
      conditions.push({
        condition: 'recruitment.gender IN (:...gd)',
        parameters: { gd: transformedGender },
      });
    }

    // salary 조건 처리
    if (selectedOptionsDto.selectedSalary?.length) {
      let slyConditions = [`JSON_CONTAINS(recruitment.salary, :sly) > 0`];

      if (selectedOptionsDto.flexibleOptions[4] == 1) {
        slyConditions.push(
          `JSON_CONTAINS(recruitment.salary, '["명시 안 됨"]') > 0`,
          `JSON_CONTAINS(recruitment.salary, '["채용공고참고"]') > 0`,
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
            '(recruitment.maxClassFee >= :mcf or recruitment.maxClassFee <= -1)',
          parameters: { mcf: selectedOptionsDto.selectedMaxClassFee },
        });
      } else {
        conditions.push({
          condition: 'recruitment.maxClassFee >= :mcf',
          parameters: { mcf: selectedOptionsDto.selectedMaxClassFee },
        });
      }
    }

    // wellfare 조건 처리
    if (selectedOptionsDto.selectedWelfare?.length) {
      if (selectedOptionsDto.flexibleOptions[6] == 1) {
        selectedOptionsDto.selectedWelfare.push('명시 안 됨');
      }
      conditions.push({
        condition: 'JSON_OVERLAPS(recruitment.welfare, :wf) > 0',
        parameters: {
          wf: JSON.stringify(selectedOptionsDto.selectedWelfare),
        },
      });
    }

    // qualification 조건 처리
    if (selectedOptionsDto.selectedQualification?.length) {
      if (selectedOptionsDto.flexibleOptions[7] == 1) {
        selectedOptionsDto.selectedQualification.push('명시 안 됨');
        selectedOptionsDto.selectedQualification.push('채용공고참고');
      }
      selectedOptionsDto.selectedQualification.push('없음');
      conditions.push({
        condition: 'JSON_OVERLAPS(recruitment.qualification, :qfc) > 0',
        parameters: {
          qfc: JSON.stringify(selectedOptionsDto.selectedQualification),
        },
      });
    }

    // preference 조건 처리
    if (selectedOptionsDto.selectedPreference?.length) {
      if (selectedOptionsDto.flexibleOptions[8] == 1) {
        selectedOptionsDto.selectedPreference.push('명시 안 됨');
        selectedOptionsDto.selectedPreference.push('채용공고참고');
      }
      selectedOptionsDto.selectedPreference.push('없음');
      conditions.push({
        condition: 'JSON_OVERLAPS(recruitment.preference, :pre) > 0',
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
    queryBuilder.orderBy('recruitment.date', 'DESC');

    // 총 개수 가져오기
    const totalCount = await queryBuilder.getCount();

    // 페이징 처리
    queryBuilder.take(limit).skip((page - 1) * limit);

    // 최종 데이터 가져오기
    const objectList = await queryBuilder.getMany();

    return {
      recruitmentsList: objectList.map(
        (recruitment) => new RecruitmentResponseDto(recruitment),
      ),
      page,
      totalRecruitments: totalCount, // 전체 헬스장 수
      totalPages: Math.ceil(totalCount / limit), // 총 페이지 수
    };
  }

  // 채용 공고 1개 조회
  async getOne(id: number): Promise<RecruitmentResponseDto> {
    const recruitment = await this.recruitmentRepository.findOneBy({ id });
    if (!recruitment) {
      throw new NotFoundException('There is no recruitment');
    }
    recruitment.view = recruitment.view + 1;
    const savedRecruitment = await this.recruitmentRepository.save(recruitment);
    return new RecruitmentResponseDto(savedRecruitment);
  }

  // 인기 공고 조회
  async getPopular(num: number): Promise<RecruitmentResponseDto[]> {
    const popularRecruitments = await this.recruitmentRepository.find({
      order: {
        view: 'DESC',
      },
      take: num,
    });
    const recruitmentList = popularRecruitments.map(
      (recruitment) => new RecruitmentResponseDto(recruitment),
    );
    return recruitmentList;
  }

  // 즐겨찾기 등록 or 해제
  async registerBookmark(user: UserEntity, id: number): Promise<void> {
    const existBookmark = await this.bookmarkRepository.findOne({
      where: {
        user: { id: user.id },
        recruitment: { id },
      },
    });
    if (existBookmark) {
      await this.bookmarkRepository.delete({ id: existBookmark.id });
    } else {
      const recruitmentForBookmark = await this.recruitmentRepository.findOneBy(
        { id },
      );
      if (!recruitmentForBookmark) {
        throw new NotFoundException('There is no recruitment for selected id');
      }
      const newBookmark = this.bookmarkRepository.create({
        user,
        recruitment: recruitmentForBookmark,
      });
      await this.bookmarkRepository.save(newBookmark);
    }
  }

  // 즐겨찾기 공고 불러오기
  async getBookmarked(user: UserEntity): Promise<RecruitmentResponseDto[]> {
    const bookmarks = await this.bookmarkRepository.findBy({ user });

    const recruitmentList = bookmarks.map(
      (recruitment) => new RecruitmentResponseDto(recruitment.recruitment),
    );
    return recruitmentList;
  }

  // 채용 공고 등록 가능 여부 확인
  async canRegisterRecruitment(center: CenterEntity): Promise<boolean> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (myRecruitment) {
      return false;
    }
    return true;
  }

  // method3: 공고 등록하기
  async registerRecruitment(
    center: CenterEntity,
    recruitmentRegisterRequestDto: RecruitmentRegisterRequestDto,
  ): Promise<RecruitmentResponseDto> {
    if (!(await this.canRegisterRecruitment(center))) {
      throw new ForbiddenException('Your hiring recruitment already exists');
    }
    const {
      workType,
      workTime,
      weekendDuty,
      gender,
      salary,
      basePay,
      classPay,
      classFee,
      monthly,
      hourly,
      welfare,
      qualification,
      preference,
      description,
      image,
      apply,
    } = recruitmentRegisterRequestDto;

    const seperatedAddress = await this.extractLocation(center.address);
    const maxClassFee = classFee ? classFee[1] : -2;

    const weekendDutyMap = {
      [TWeekendDuty.YES]: 1,
      [TWeekendDuty.NO]: 2,
    };
    const transformedWeekendDuty = weekendDutyMap[weekendDuty];

    const genderMap = {
      [TGender.BOTH]: 1,
      [TGender.MALE]: 2,
      [TGender.FEMALE]: 3,
    };
    const transformedGender = genderMap[gender];

    const newRecruitment = this.recruitmentRepository.create({
      centerName: center.centerName,
      city: seperatedAddress.city,
      location: seperatedAddress.location,
      address: center.address,
      workType,
      workTime,
      weekendDuty: transformedWeekendDuty,
      gender: transformedGender,
      salary,
      maxClassFee: maxClassFee,
      basePay,
      classPay,
      classFee,
      monthly,
      hourly,
      welfare,
      qualification,
      preference,
      site: ['직접 등록'],
      date: new Date(),
      description,
      center: center,
      image, // 이미지 URL 저장
      view: 0,
      apply,
    });

    const savedRecruitment =
      await this.recruitmentRepository.save(newRecruitment);
    return new RecruitmentResponseDto(savedRecruitment);
  }

  // method4: 주소에서 시/도, 시/군/구 추출
  async extractLocation(
    address: string,
  ): Promise<{ city: string; location: string }> {
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
      /^([가-힣]+(시|군|구))(?:\s([가-힣]+(구|군)))?/,
    );

    if (!locationMatch) {
      throw new BadRequestException(
        'Invalid address: 시/군/구 정보를 찾을 수 없습니다.',
      );
    }

    // locationMatch[0] 전체 매칭 문자열, ex: "성남시 분당구"
    const location =
      locationMatch[3] != null
        ? `${locationMatch[1]} ${locationMatch[3]}`
        : locationMatch[1];

    return { city, location };
  }

  // method5: 내 채용 중 공고 불러오기
  async getMyRecruitment(
    center: CenterEntity,
  ): Promise<RecruitmentResponseDto | null> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      return null;
    }
    return new RecruitmentResponseDto(myRecruitment);
  }

  // method6: 내 만료된 공고 불러오기
  async getMyExpiredRecruitments(
    center: CenterEntity,
  ): Promise<RecruitmentResponseDto[]> {
    const myExpiredRecruitments =
      await this.expiredRecruitmentRepository.findBy({ center });
    return myExpiredRecruitments.map(
      (recruitment) => new RecruitmentResponseDto(recruitment),
    );
  }

  // 내 공고 1개 불러오기
  async getMyOneRecruitment(
    center: CenterEntity,
    id: number,
    ishiring: number,
  ): Promise<RecruitmentResponseDto> {
    let myRecruitment: RecruitmentEntity | ExpiredRecruitmentEntity;
    if (ishiring == 0) {
      myRecruitment = await this.recruitmentRepository.findOneBy({
        id,
        center,
      });
    } else {
      myRecruitment = await this.expiredRecruitmentRepository.findOneBy({
        id,
        center,
      });
    }
    if (!myRecruitment) {
      throw new NotFoundException('There is no recruitment');
    }
    return new RecruitmentResponseDto(myRecruitment);
  }

  // method7: 내 채용 중 공고 끌어올리기
  async refreshMyRecruitment(center: CenterEntity): Promise<void> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    // 하루에 한 번만
    const date = myRecruitment.date;
    if (new Date(date).getDate() == new Date().getDate()) {
      throw new ForbiddenException('You already updated recruitment today');
    }
    myRecruitment.date = new Date();
    await this.recruitmentRepository.save(myRecruitment);
  }

  // method8: 내 채용 중 공고 만료시키기
  async expireMyRecruitment(center: CenterEntity): Promise<void> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hring recruitment');
    }
    const { id, ...recruitmentData } = myRecruitment;
    const expiredRecruitment = this.expiredRecruitmentRepository.create({
      ...recruitmentData, // 기존 데이터 복사
    });
    await this.expiredRecruitmentRepository.save(expiredRecruitment);
    await this.deleteHiring(center);
  }

  // method9: 내 채용 중 공고 삭제하기
  async deleteHiring(center: CenterEntity): Promise<void> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }
    await this.recruitmentRepository.delete({ center });
  }

  // method10: 내 만료된 공고 삭제하기
  async deleteExpired(id: number): Promise<void> {
    const myRecruitment = await this.expiredRecruitmentRepository.findOneBy({
      id,
    });
    if (!myRecruitment) {
      throw new NotFoundException(
        'There is no expired recruitment for selected id',
      );
    }
    await this.expiredRecruitmentRepository.delete({ id });
  }

  // 주말당직 수정하기
  async modifyWeekendDuty(
    center: CenterEntity,
    weekendDutyModifyRequestDto: WeekendDutyModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    const weekendDutyMap = {
      [TWeekendDuty.YES]: 1,
      [TWeekendDuty.NO]: 2,
    };
    const transformedWeekendDuty =
      weekendDutyMap[weekendDutyModifyRequestDto.weekendDuty];

    myRecruitment.weekendDuty = transformedWeekendDuty;

    const updatedRecruitment =
      await this.recruitmentRepository.save(myRecruitment);
    return new RecruitmentResponseDto(updatedRecruitment);
  }

  // 지원조건 수정하기
  async modifyApplyCondition(
    center: CenterEntity,
    applyConditionModifyRequestDto: ApplyConditionModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    const genderMap = {
      [TGender.BOTH]: 1,
      [TGender.MALE]: 2,
      [TGender.FEMALE]: 3,
    };
    const transformedGender = genderMap[applyConditionModifyRequestDto.gender];

    await this.recruitmentRepository.update(myRecruitment.id, {
      ...applyConditionModifyRequestDto,
      gender: transformedGender,
    });

    const updatedRecruitment = await this.recruitmentRepository.findOneBy({
      id: myRecruitment.id,
    });

    return new RecruitmentResponseDto(updatedRecruitment);
  }

  // 급여조건 수정하기
  async modifySalaryCondition(
    center: CenterEntity,
    salaryCondtionModifyRequestDto: SalaryCondtionModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    const maxClassFee = salaryCondtionModifyRequestDto.classFee
      ? salaryCondtionModifyRequestDto.classFee[1]
      : -2;

    await this.recruitmentRepository.update(myRecruitment.id, {
      ...salaryCondtionModifyRequestDto,
      maxClassFee: maxClassFee,
    });

    const updatedRecruitment = await this.recruitmentRepository.findOneBy({
      id: myRecruitment.id,
    });

    return new RecruitmentResponseDto(updatedRecruitment);
  }

  // 지원방법 수정하기
  async modifyApply(
    center: CenterEntity,
    applyModifyRequestDto: ApplyModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    myRecruitment.apply = applyModifyRequestDto.apply;

    const updatedRecruitment =
      await this.recruitmentRepository.save(myRecruitment);
    return new RecruitmentResponseDto(updatedRecruitment);
  }

  // 상세요강 수정하기
  async modifyDetail(
    center: CenterEntity,
    detailModifyRequestDto: DetailModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const myRecruitment = await this.recruitmentRepository.findOneBy({
      center,
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    await this.recruitmentRepository.update(myRecruitment.id, {
      ...detailModifyRequestDto,
    });

    const updatedRecruitment = await this.recruitmentRepository.findOneBy({
      id: myRecruitment.id,
    });

    return new RecruitmentResponseDto(updatedRecruitment);
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
      const fileKey = `register/${centerName}-register/${file.originalname}`;

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
