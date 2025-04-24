import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { SelectedOptionsRequestDto } from './dto/recruitment-dto/request-dto/selected-options-request-dto';
import { RecruitmentEntity } from './entity/recruitment.entity';
import {
  RecruitmentRegisterRequestDto,
  TGender,
  TWeekendDuty,
} from './dto/recruitment-dto/request-dto/recruitment-register-request-dto';
import { CenterEntity } from 'src/auth/entity/center.entity';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ApplyConditionModifyRequestDto } from './dto/recruitment-dto/request-dto/apply-condition-modify-request-dto';
import { SalaryCondtionModifyRequestDto } from './dto/recruitment-dto/request-dto/salary-condition-modify-request-dto';
import { ApplyModifyRequestDto } from './dto/recruitment-dto/request-dto/apply-modify-request-dto';
import { DetailModifyRequestDto } from './dto/recruitment-dto/request-dto/detail-modify-request-dto';
import { BookmarkEntity } from './entity/bookmark.entity';
import { VillyEntity } from './entity/villy.entity';
import { ResumeisProposedResponseDto } from 'src/auth/dto/resume-dto/response-dto/resume-isProposed-response-dto';
import { RecruitmentListLocationResponseDto } from './dto/recruitment-dto/response-dto/recruitmentList-location-response-dto';
import { UserEntity } from 'src/auth/entity/user/user.entity';
import { ResumeEntity } from 'src/auth/entity/resume/resume.entity';
import { RecruitmentResponseDto } from './dto/recruitment-dto/response-dto/recruitment-response-dto';
import { WeekendDutyModifyRequestDto } from './dto/recruitment-dto/request-dto/weekendDuty-modify-request-dto';
import { VillyResponseDto } from './dto/villy-dto/villy-response-dto';
import { NotionRecruitmentEntity } from './entity/notion-recruitment.entity';
import { VillySchedulerService } from './villy.scheduler.service';
import { FirebaseService } from 'src/firebase.service';
import { CareerEntity } from 'src/auth/entity/resume/career.entity';
import { AcademyEntity } from 'src/auth/entity/resume/academy.entity';
import { QualificationEntity } from 'src/auth/entity/resume/qualification.entity';

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
    @InjectRepository(BookmarkEntity)
    private bookmarkRepository: Repository<BookmarkEntity>,
    @InjectRepository(CenterEntity)
    private centerRepository: Repository<CenterEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ResumeEntity)
    private resumeRepository: Repository<ResumeEntity>,
    @InjectRepository(VillyEntity)
    private villyRepository: Repository<VillyEntity>,
    @InjectRepository(NotionRecruitmentEntity)
    private notionRecruitmentRepository: Repository<NotionRecruitmentEntity>,
    @InjectRepository(CareerEntity)
    private careerRepository: Repository<CareerEntity>,
    @InjectRepository(AcademyEntity)
    private academyRepository: Repository<AcademyEntity>,
    @InjectRepository(QualificationEntity)
    private qualificationRepository: Repository<QualificationEntity>,
    private villySchedulerService: VillySchedulerService,
    private firebaseService: FirebaseService,
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
    return await this.recruitmentRepository.countBy({ isHiring: 1 });
  }

  // 즐겨찾기 여부 확인
  async isBookmarked(
    user: UserEntity,
    recruitment: RecruitmentEntity,
  ): Promise<boolean> {
    const existBookmark = await this.bookmarkRepository.findOne({
      where: {
        user: { id: user.id },
        recruitment: { id: recruitment.id },
      },
    });
    if (existBookmark) {
      return true;
    } else {
      return false;
    }
  }

  // method1 : 모든 공고 가져오기
  async getAll(
    page: number,
    limit: number,
    user?: UserEntity,
  ): Promise<{
    recruitmentList: RecruitmentResponseDto[];
    page: number;
    totalRecruitments: number;
    totalPages: number;
  }> {
    const [recruitmentList, totalCount] =
      await this.recruitmentRepository.findAndCount({
        where: { isHiring: 1 },
        order: { date: 'DESC' }, // 최신순 정렬
        take: limit, // 한 페이지에 보여줄 개수
        skip: (page - 1) * limit, // 페이지 계산
        relations: ['center'],
      });
    // 비회원 처리
    if (!user) {
      return {
        recruitmentList: recruitmentList.map(
          (recruitment) => new RecruitmentResponseDto(recruitment),
        ),
        page,
        totalRecruitments: totalCount, // 전체 헬스장 수
        totalPages: Math.ceil(totalCount / limit), // 총 페이지 수
      };
    }
    // 즐겨찾기 처리
    const bookmarks = await this.bookmarkRepository.find({
      where: { user: { id: user.id } }, // 확실한 조건 명시
      relations: ['recruitment'], // 즐겨찾기한 공고 정보도 함께 로딩
    });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.recruitment.id));

    const mappedRecruitmentList = recruitmentList.map((recruitment) => {
      const isBookmarked = bookmarkedIds.has(recruitment.id);
      return new RecruitmentResponseDto(recruitment, isBookmarked);
    });

    return {
      recruitmentList: mappedRecruitmentList,
      page,
      totalRecruitments: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  // method2 : 조건에 맞는 헬스장 리스트 가져오기
  async searchSelected(
    selectedOptionsDto: SelectedOptionsRequestDto,
    page: number,
    limit: number,
    user?: UserEntity,
  ): Promise<{
    recruitmentList: RecruitmentResponseDto[];
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

    // 채용 중 여부 처리
    conditions.push({
      condition: 'recruitment.isHiring = :isHiring',
      parameters: { isHiring: 1 },
    });

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
      if (selectedOptionsDto.flexibleOption) {
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
      if (selectedOptionsDto.flexibleOption) {
        selectedOptionsDto.selectedWorkTime.push('명시 안 됨');
        selectedOptionsDto.selectedWorkTime.push('채용공고참고');
      }
      selectedOptionsDto.selectedWorkTime.push('협의 가능');
      conditions.push({
        condition: 'JSON_OVERLAPS(recruitment.workTime, :wti) > 0',
        parameters: {
          wti: JSON.stringify(selectedOptionsDto.selectedWorkTime),
        },
      });
    }

    // weekendDuty 조건 처리
    if (selectedOptionsDto.selectedWeekendDuty?.length) {
      if (selectedOptionsDto.flexibleOption) {
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
      if (selectedOptionsDto.flexibleOption) {
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

      if (selectedOptionsDto.flexibleOption) {
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
      if (selectedOptionsDto.flexibleOption) {
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
      if (selectedOptionsDto.flexibleOption) {
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
      if (selectedOptionsDto.flexibleOption) {
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
      if (selectedOptionsDto.flexibleOption) {
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

    // 비회원 처리
    if (!user) {
      return {
        recruitmentList: objectList.map(
          (recruitment) => new RecruitmentResponseDto(recruitment),
        ),
        page,
        totalRecruitments: totalCount, // 전체 헬스장 수
        totalPages: Math.ceil(totalCount / limit), // 총 페이지 수
      };
    }

    // 즐겨찾기 처리
    const bookmarks = await this.bookmarkRepository.find({
      where: { user: { id: user.id } }, // 확실한 조건 명시
      relations: ['recruitment'], // 즐겨찾기한 공고 정보도 함께 로딩
    });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.recruitment.id));

    const mappedRecruitmentList = objectList.map((recruitment) => {
      const isBookmarked = bookmarkedIds.has(recruitment.id);
      return new RecruitmentResponseDto(recruitment, isBookmarked);
    });

    return {
      recruitmentList: mappedRecruitmentList,
      page,
      totalRecruitments: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  // 채용 공고 1개 조회
  async getOne(id: number, user?: UserEntity): Promise<RecruitmentResponseDto> {
    const recruitment = await this.recruitmentRepository.findOneBy({
      id,
    });
    if (!recruitment) {
      throw new NotFoundException('There is no recruitment for selected id');
    }
    recruitment.view = recruitment.view + 1;
    const savedRecruitment = await this.recruitmentRepository.save(recruitment);

    // 즐겨찾기 처리
    if (user instanceof UserEntity) {
      if (await this.isBookmarked(user, savedRecruitment)) {
        return new RecruitmentResponseDto(savedRecruitment, true);
      }
    }
    return new RecruitmentResponseDto(savedRecruitment);
  }

  // 인기 공고 조회
  async getPopular(
    num: number,
    user?: UserEntity,
  ): Promise<RecruitmentResponseDto[]> {
    const popularRecruitments = await this.recruitmentRepository.find({
      where: { isHiring: 1 },
      order: {
        view: 'DESC',
      },
      take: num,
    });

    // 비회원 처리
    if (!user) {
      const recruitmentList = popularRecruitments.map(
        (recruitment) => new RecruitmentResponseDto(recruitment),
      );
      return recruitmentList;
    }
    // 즐겨찾기 처리
    const bookmarks = await this.bookmarkRepository.find({
      where: { user: { id: user.id } }, // 확실한 조건 명시
      relations: ['recruitment'], // 즐겨찾기한 공고 정보도 함께 로딩
    });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.recruitment.id));

    const recruitmentList = popularRecruitments.map((recruitment) => {
      const isBookmarked = bookmarkedIds.has(recruitment.id);
      return new RecruitmentResponseDto(recruitment, isBookmarked);
    });
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
      await this.bookmarkRepository.remove(existBookmark);
    } else {
      const recruitmentForBookmark = await this.recruitmentRepository.findOneBy(
        { id, isHiring: 1 },
      );
      if (!recruitmentForBookmark) {
        throw new NotFoundException('There is no recruitment for selected id');
      }
      await this.bookmarkRepository.save({
        user,
        recruitment: recruitmentForBookmark,
      });
    }
  }

  // 즐겨찾기 공고 불러오기
  async getBookmarked(user: UserEntity): Promise<RecruitmentResponseDto[]> {
    const bookmarks = await this.bookmarkRepository.find({
      where: { user: { id: user.id } }, // 확실한 조건 명시
      relations: ['recruitment'], // 즐겨찾기한 공고 정보도 함께 로딩
    });

    const recruitmentList = bookmarks.map(
      (bookmark) => new RecruitmentResponseDto(bookmark.recruitment, true),
    );
    return recruitmentList;
  }

  // 채용 공고 등록 가능 여부 확인
  async canRegisterRecruitment(center: CenterEntity): Promise<boolean> {
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
        isHiring: 1,
      },
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

    const toNullableArray = <T>(arr?: T[]): T[] | null =>
      !arr || arr.length === 0 ? null : arr;
    const toNullableString = (value?: string): string | null =>
      !value || value.trim() === '' ? null : value;

    const newRecruitment = await this.recruitmentRepository.save({
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
      basePay: toNullableArray(basePay),
      classPay: toNullableArray(classPay),
      classFee: toNullableArray(classFee),
      monthly: toNullableArray(monthly),
      hourly: toNullableArray(hourly),
      welfare,
      qualification,
      preference,
      site: { 빌리지: ['직접 등록'] },
      description: toNullableString(description),
      center: center,
      image: toNullableArray(image), // 이미지 URL 저장
      apply,
      view: 0,
      date: new Date(),
      isHiring: 1,
    });

    return new RecruitmentResponseDto(newRecruitment);
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
  async getMyRecruitment(center: CenterEntity): Promise<{
    myRecruitment: RecruitmentResponseDto | null;
    hiringApply: number;
  }> {
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
        isHiring: 1,
      },
    });
    if (!myRecruitment) {
      return { myRecruitment: null, hiringApply: 0 };
    }

    const applyVillies = await this.villyRepository.count({
      where: {
        recruitment: { id: myRecruitment.id },
        messageType: 1,
      },
    });
    return {
      myRecruitment: new RecruitmentResponseDto(myRecruitment),
      hiringApply: applyVillies,
    };
  }

  // method6: 내 만료된 공고 불러오기
  async getMyExpiredRecruitments(center: CenterEntity): Promise<{
    myExpiredRecruitments: RecruitmentResponseDto[];
    expiredApplies: number[];
  }> {
    const expiredRecruitments = await this.recruitmentRepository.find({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
        isHiring: 0,
      },
    });
    const myExpiredRecruitments = expiredRecruitments.map(
      (recruitment) => new RecruitmentResponseDto(recruitment),
    );

    const expiredApplies = [];
    for (const expiredRecruitment of expiredRecruitments) {
      const applyVillies = await this.villyRepository.count({
        where: {
          recruitment: { id: expiredRecruitment.id },
          messageType: 1,
        },
      });
      expiredApplies.push(applyVillies);
    }
    return { myExpiredRecruitments, expiredApplies };
  }

  // 내 공고 1개 불러오기
  async getMyOneRecruitment(
    center: CenterEntity,
    id: number,
  ): Promise<RecruitmentResponseDto> {
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        id,
        center: { id: center.id }, // 명시적으로 id 사용
      },
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no recruitment for selected id');
    }
    return new RecruitmentResponseDto(myRecruitment);
  }

  // method7: 내 채용 중 공고 끌어올리기
  async refreshMyRecruitment(center: CenterEntity): Promise<void> {
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
        isHiring: 1,
      },
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
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
        isHiring: 1,
      },
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hring recruitment');
    }

    // 북마크 모두 해제
    await this.bookmarkRepository.delete({
      recruitment: { id: myRecruitment.id },
    });

    myRecruitment.isHiring = 0;
    await this.recruitmentRepository.save(myRecruitment);
  }

  // method9: 내 공고 삭제하기
  async deleteRecruitment(center: CenterEntity, id: number): Promise<void> {
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        id,
        center: { id: center.id }, // 명시적으로 id 사용
      },
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no recruitment for selected id');
    }

    // 공고 이미지 삭제
    if (myRecruitment.image) {
      for (const url of myRecruitment.image) {
        const fileKey = url.split('com/')[1];
        const params = {
          Bucket: this.bucketName,
          Key: fileKey,
        };
        await this.s3.send(new DeleteObjectCommand(params));
      }
    }

    await this.recruitmentRepository.remove(myRecruitment);
  }

  // 주말당직 수정하기
  async modifyWeekendDuty(
    center: CenterEntity,
    weekendDutyModifyRequestDto: WeekendDutyModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
      },
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    const isApplied = await this.villyRepository.findOne({
      where: {
        recruitment: { id: myRecruitment.id },
        messageType: 1,
      },
    });
    if (isApplied) {
      throw new ForbiddenException('Yon cannot modify applied recruitment');
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
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
      },
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    const isApplied = await this.villyRepository.findOne({
      where: {
        recruitment: { id: myRecruitment.id },
        messageType: 1,
      },
    });
    if (isApplied) {
      throw new ForbiddenException('Yon cannot modify applied recruitment');
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
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
      },
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    const isApplied = await this.villyRepository.findOne({
      where: {
        recruitment: { id: myRecruitment.id },
        messageType: 1,
      },
    });
    if (isApplied) {
      throw new ForbiddenException('Yon cannot modify applied recruitment');
    }

    const toNullableArray = <T>(arr?: T[]): T[] | null =>
      !arr || arr.length === 0 ? null : arr;

    const { salary, basePay, classPay, classFee, monthly, hourly, welfare } =
      salaryCondtionModifyRequestDto;

    const maxClassFee = salaryCondtionModifyRequestDto.classFee
      ? salaryCondtionModifyRequestDto.classFee[1]
      : -2;

    await this.recruitmentRepository.update(myRecruitment.id, {
      salary,
      basePay: toNullableArray(basePay),
      classPay: toNullableArray(classPay),
      classFee: toNullableArray(classFee),
      monthly: toNullableArray(monthly),
      hourly: toNullableArray(hourly),
      maxClassFee: maxClassFee,
      welfare,
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
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
      },
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    const isApplied = await this.villyRepository.findOne({
      where: {
        recruitment: { id: myRecruitment.id },
        messageType: 1,
      },
    });
    if (isApplied) {
      throw new ForbiddenException('Yon cannot modify applied recruitment');
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
    const myRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
      },
    });
    if (!myRecruitment) {
      throw new NotFoundException('There is no hiring recruitment');
    }

    const isApplied = await this.villyRepository.findOne({
      where: {
        recruitment: { id: myRecruitment.id },
        messageType: 1,
      },
    });
    if (isApplied) {
      throw new ForbiddenException('Yon cannot modify applied recruitment');
    }

    // 기존 이미지 url 중 유지하지 않는 url s3에서 삭제
    if (myRecruitment.image) {
      if (detailModifyRequestDto.image) {
        const newUrl = new Set(detailModifyRequestDto.image);
        for (const url of myRecruitment.image) {
          if (!newUrl.has(url)) {
            const fileKey = url.split('com/')[1];
            const params = {
              Bucket: this.bucketName,
              Key: fileKey,
            };
            await this.s3.send(new DeleteObjectCommand(params));
          }
        }
      } else {
        for (const url of myRecruitment.image) {
          const fileKey = url.split('com/')[1];
          const params = {
            Bucket: this.bucketName,
            Key: fileKey,
          };
          await this.s3.send(new DeleteObjectCommand(params));
        }
      }
    }

    const toNullableArray = <T>(arr?: T[]): T[] | null =>
      !arr || arr.length === 0 ? null : arr;

    const toNullableString = (value?: string): string | null =>
      !value || value.trim() === '' ? null : value;

    await this.recruitmentRepository.update(myRecruitment.id, {
      description: toNullableString(detailModifyRequestDto.description),
      image: toNullableArray(detailModifyRequestDto.image),
    });

    const updatedRecruitment = await this.recruitmentRepository.findOneBy({
      id: myRecruitment.id,
    });

    return new RecruitmentResponseDto(updatedRecruitment);
  }

  // method12: 다중 이미지 S3 업로드
  async uploadImages(
    center: CenterEntity,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const existRecruitment = await this.recruitmentRepository.findOne({
      where: {
        center: { id: center.id }, // 명시적으로 id 사용
      },
    });

    // 이미 등록된 이미지가 있으면 시작 번호 증가
    let number = 0;
    if (existRecruitment) {
      const isApplied = await this.villyRepository.findOne({
        where: {
          recruitment: { id: existRecruitment.id },
          messageType: 1,
        },
      });
      if (isApplied) {
        throw new ForbiddenException('Yon cannot modify applied recruitment');
      }
      if (existRecruitment.image) {
        for (const url of existRecruitment.image) {
          const match = url.match(/image(\d+)/);
          const urlNumber = parseInt(match[1], 10);
          number = urlNumber > number ? urlNumber : number;
        }
        number = number + 1;
      }
    }

    if (!files || files.length === 0) {
      return [];
    }
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileKey = `recruitment/registered/${center.id}/images/image${i + number}`;

      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await this.s3.send(new PutObjectCommand(params));
      uploadedUrls.push(
        `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      );
    }

    return uploadedUrls;
  }

  // 지원하기
  async apply(user: UserEntity, id: number): Promise<void> {
    const recruitment = await this.recruitmentRepository.findOneBy({ id });

    if (!recruitment.center) {
      throw new ForbiddenException('You cannot apply to notion recruitment');
    }

    const existApplyVilly = await this.villyRepository.findOne({
      where: {
        messageType: 1,
        recruitment: { id },
        resume: { user: { id: user.id } },
      },
    });
    if (existApplyVilly) {
      throw new ConflictException('You already applied');
    }

    const myCurrentResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
        isSnapshot: 0,
      },
    });

    // snapshot 이력서 생성
    // 증명사진 s3 snapshot 복사
    const number = await this.resumeRepository.count({
      where: {
        user: { id: user.id },
        isSnapshot: 1,
      },
    });
    const profileImageOldKey = myCurrentResume.profileImage.split('com/')[1];
    const profileImageNewKey = `resume/${user.id}/snapshot/${number}/profileImage`;
    await this.s3.send(
      new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${profileImageOldKey}`, // 기존 파일
        Key: profileImageNewKey, // 새로운 위치 또는 이름
      }),
    );

    const snapshotResume = await this.resumeRepository.create({
      profileImage: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${profileImageNewKey}`,
      name: myCurrentResume.name,
      birth: myCurrentResume.birth,
      phone: myCurrentResume.phone,
      email: myCurrentResume.email,
      gender: myCurrentResume.gender,
      location: myCurrentResume.location,
      isNew: myCurrentResume.isNew,
      workType: myCurrentResume.workType,
      workTime: myCurrentResume.workTime,
      license: myCurrentResume.license,
      award: myCurrentResume.award,
      SNS: myCurrentResume.SNS,
      introduction: myCurrentResume.introduction,
      user,
      isSnapshot: 1,
    });

    // 포트폴리오 파일 s3 snaphot 복사
    if (myCurrentResume.portfolioFile) {
      const portfolioFileOldKey =
        myCurrentResume.portfolioFile.split('com/')[1];
      const portfolioFileNewKey = `resume/${user.id}/snapshot/${number}/portfolio/file`;
      await this.s3.send(
        new CopyObjectCommand({
          Bucket: this.bucketName,
          CopySource: `${this.bucketName}/${portfolioFileOldKey}`, // 기존 파일
          Key: portfolioFileNewKey, // 새로운 위치 또는 이름
        }),
      );
      snapshotResume.portfolioFile = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${portfolioFileNewKey}`;
    }

    // 포트폴리오 이미지 s3 snapshot 복사
    if (myCurrentResume.portfolioImages) {
      let i = 0;
      const uploadedUrls: string[] = [];
      for (const url of myCurrentResume.portfolioImages) {
        const portfolioImagesOldKey = url.split('com/')[1];
        const portfolioImagesNewKey = `resume/${user.id}/snapshot/${number}/portfolio/images/${i}`;
        await this.s3.send(
          new CopyObjectCommand({
            Bucket: this.bucketName,
            CopySource: `${this.bucketName}/${portfolioImagesOldKey}`, // 기존 파일
            Key: portfolioImagesNewKey, // 새로운 위치 또는 이름
          }),
        );
        uploadedUrls.push(
          `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${portfolioImagesNewKey}`,
        );
        i += 1;
      }
      snapshotResume.portfolioImages = uploadedUrls;
    }

    await this.resumeRepository.save(snapshotResume);

    if (myCurrentResume.careers) {
      for (const career of myCurrentResume.careers) {
        const { id, resume, ...rest } = career;
        await this.careerRepository.save({
          ...rest,
          resume: snapshotResume,
        });
      }
    }

    if (myCurrentResume.academy) {
      const { id, resume, ...rest } = myCurrentResume.academy;
      await this.academyRepository.save({
        ...rest,
        resume: snapshotResume,
      });
    }

    if (myCurrentResume.qualifications) {
      for (const qualifiaction of myCurrentResume.qualifications) {
        const { id, resume, ...rest } = qualifiaction;
        await this.qualificationRepository.save({
          ...rest,
          resume: snapshotResume,
        });
      }
    }

    await this.villyRepository.save({
      messageType: 1,
      resume: snapshotResume,
      recruitment,
    });

    const center = recruitment.center;
    if (center.fcmToken) {
      const fcmToken = center.fcmToken.token;
      await this.firebaseService.sendPushToDevice(
        fcmToken,
        '새로운 이력서가 도착했습니다.',
        `${snapshotResume.name}님의 이력서를 확인해주세요!`,
        'MyRecruitmentListScreen',
      );
    }
  }

  // 지원한 공고 보기
  async getAppliedRecruitments(
    user: UserEntity,
  ): Promise<RecruitmentResponseDto[]> {
    const applyVillies = await this.villyRepository.find({
      where: {
        resume: { user: { id: user.id } },
        messageType: 1,
      },
      order: { createdAt: 'DESC' }, // 최신순
    });

    const recruitmentList = applyVillies.map(
      (villy) => new RecruitmentResponseDto(villy.recruitment),
    );

    return recruitmentList;
  }

  // 지원받은 이력서 보기
  async getAppliedResumes(id: number): Promise<ResumeisProposedResponseDto[]> {
    const applyVillies = await this.villyRepository.find({
      where: {
        recruitment: { id },
        messageType: 1,
      },
      order: { createdAt: 'DESC' }, // 최신순
    });

    let resumeList = [];
    for (const villy of applyVillies) {
      const proposalVilly = await this.villyRepository.findOne({
        where: {
          resume: { id: villy.resume.id },
          recruitment: { id },
          messageType: 2,
        },
      });

      if (proposalVilly) {
        resumeList.push(new ResumeisProposedResponseDto(villy.resume, true));
      } else {
        resumeList.push(new ResumeisProposedResponseDto(villy.resume, false));
      }
    }

    return resumeList;
  }

  // 면접 제안하기
  async proposeInterview(
    recruitmentId: number,
    resumeId: number,
  ): Promise<void> {
    const recruitment = await this.recruitmentRepository.findOneBy({
      id: recruitmentId,
    });

    const existProposalVilly = await this.villyRepository.findOne({
      where: {
        messageType: 2,
        recruitment: { id: recruitment.id },
        resume: { id: resumeId },
      },
    });
    if (existProposalVilly) {
      throw new ConflictException('You already proposed interview');
    }

    const resume = await this.resumeRepository.findOneBy({ id: resumeId });

    await this.villyRepository.save({
      messageType: 2,
      resume,
      recruitment,
    });

    if (resume.user.fcmToken) {
      const fcmToken = resume.user.fcmToken.token;
      await this.firebaseService.sendPushToDevice(
        fcmToken,
        '면접을 제안받았습니다.',
        `${recruitment.centerName}의 면접 제안을 확인해주세요!`,
        'ChattingScreen',
      );
    }
  }

  // 내 주변 공고 불러오기
  async getNearby(
    num: number,
    member?: UserEntity | CenterEntity,
  ): Promise<RecruitmentListLocationResponseDto> {
    const queryBuilder = this.recruitmentRepository
      .createQueryBuilder('recruitment')
      .leftJoinAndSelect('recruitment.center', 'center');
    const conditions: {
      condition: string;
      parameters?: Record<string, any>;
    }[] = [];

    // 채용 중 여부 처리
    conditions.push({
      condition: 'recruitment.isHiring = :isHiring',
      parameters: { isHiring: 1 },
    });

    // user, resume 여부에 따라 location 값 처리
    let finalLocation: Record<string, string[]>;

    if (member instanceof UserEntity) {
      const resume = await this.resumeRepository.findOne({
        where: {
          user: { id: member.id },
          isSnapshot: 0,
        },
      });

      finalLocation = resume?.location ?? { 서울: ['강남구'] };
    } else if (member instanceof CenterEntity) {
      const { city, location } = await this.extractLocation(member.address);
      finalLocation = { [city]: [location] };
    } else {
      finalLocation = { 서울: ['강남구'] };
    }

    // location 조건 처리
    const locConditions: string[] = [];
    const locParameters: Record<string, any> = {};

    let index = 0;
    for (const [city, districts] of Object.entries(finalLocation)) {
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

    // 개수 처리
    queryBuilder.take(num);

    // 최종 데이터 가져오기
    const objectList = await queryBuilder.getMany();

    const recruitmentList = objectList.map(
      (recruitment) => new RecruitmentResponseDto(recruitment),
    );
    // 비회원 처리
    if (!member || member instanceof CenterEntity) {
      return new RecruitmentListLocationResponseDto(
        finalLocation,
        recruitmentList,
      );
    }

    // 즐겨찾기 처리
    const bookmarks = await this.bookmarkRepository.find({
      where: { user: { id: member.id } }, // 확실한 조건 명시
      relations: ['recruitment'], // 즐겨찾기한 공고 정보도 함께 로딩
    });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.recruitment.id));

    const mappedRecruitmentList = objectList.map((recruitment) => {
      const isBookmarked = bookmarkedIds.has(recruitment.id);
      return new RecruitmentResponseDto(recruitment, isBookmarked);
    });

    return new RecruitmentListLocationResponseDto(
      finalLocation,
      mappedRecruitmentList,
    );
  }

  // 빌리
  async getVillies(user: UserEntity): Promise<VillyResponseDto[]> {
    const villies = await this.villyRepository.find({
      where: {
        resume: { user: { id: user.id } },
      },
      order: { createdAt: 'ASC' }, // 오래된 순
    });
    return villies.map((villy) => new VillyResponseDto(villy));
  }

  // 새로운 매칭보기
  async getNewMatching(user: UserEntity): Promise<VillyResponseDto[]> {
    // 하루 세번 재한
    const count = await this.villyRepository.count({
      where: {
        messageType: 0,
        resume: { user: { id: user.id } },
        createdAt: Raw((alias) => `DATE(${alias}) = CURDATE()`),
      },
    });
    if (count == 3) {
      throw new ForbiddenException('Already matched three times today');
    }
    const matchedRecruitment =
      await this.villySchedulerService.getMatched(user);
    if (!matchedRecruitment) {
      throw new NotFoundException(
        'There is no more recruitment for your resume',
      );
    }
    const myCurrentResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
        isSnapshot: 0,
      },
    });
    await this.villyRepository.save({
      messageType: 0,
      resume: myCurrentResume,
      recruitment: matchedRecruitment,
    });
    return await this.getVillies(user);
  }

  // 파일 업데이트
  async notionRecruitmentsUpdate(): Promise<void> {
    // 전체 데이터
    const notionRecruitments = await this.notionRecruitmentRepository.find();
    const dbRecruitments = await this.recruitmentRepository.findBy({
      center: null,
    });

    // 비교 Map
    const dbMap = new Map(
      dbRecruitments.map((dbRecruitment) => [
        `${dbRecruitment.centerName}_${dbRecruitment.address}`,
        dbRecruitment,
      ]),
    );

    const notionKeySet = new Set<string>();

    for (const notionRecruitment of notionRecruitments) {
      const key = `${notionRecruitment.centerName}_${notionRecruitment.address}`;
      notionKeySet.add(key);

      const existRecruitment = dbMap.get(key);
      const { id, ...dataWithoutId } = notionRecruitment;

      if (existRecruitment) {
        await this.recruitmentRepository.update(
          existRecruitment.id,
          dataWithoutId,
        );
      } else {
        await this.recruitmentRepository.save(dataWithoutId);
      }
    }

    // 3. Notion에 존재하지 않는 DB 레코드는 삭제
    for (const recruitment of dbRecruitments) {
      const key = `${recruitment.centerName}_${recruitment.address}`;
      if (!notionKeySet.has(key)) {
        await this.recruitmentRepository.delete(recruitment.id);
      }
    }
  }
}
