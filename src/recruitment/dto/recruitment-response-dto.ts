import { ApiProperty } from '@nestjs/swagger';
import { RecruitmentEntity } from '../entity/recruitment.entity';

export class RecruitmentResponseDto {
  @ApiProperty({
    type: Number,
    description: 'id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: '센터명',
    example: '빌리지 헬스장',
  })
  centerName: string;

  @ApiProperty({
    type: String,
    description: '시/도',
    example: '서울',
  })
  city: string;

  @ApiProperty({
    type: String,
    description: '시/군/구',
    example: '송파구',
  })
  location: string;

  @ApiProperty({
    type: String,
    description: '주소',
    example: '서울 송파구 올림픽로99',
  })
  address: string;

  @ApiProperty({
    type: [String],
    description: '근무 형태',
    example: ['정규직, 프리랜서'],
  })
  workType: string[];

  @ApiProperty({
    type: [String],
    description: '근무 시간',
    example: ['오전~오후 풀타임', '자유 근무'],
  })
  workTime: string[];

  @ApiProperty({
    type: String,
    description: '주말 당직  \n명시 안 됨, 있음, 없음, 중 한 가지만 선택 가능',
    example: '있음',
  })
  weekendDuty: string;

  @ApiProperty({
    type: String,
    description: '성별',
    example: '성별 무관',
  })
  gender: string;

  @ApiProperty({
    type: [String],
    description: '급여 조건',
    example: ['기본급', '인센티브'],
  })
  salary: string[];

  @ApiProperty({
    type: Number,
    description: '최대 수업료(%)  \n채용 공고 참고 : -1  \n명시 안 됨 : -2',
    example: -1,
  })
  maxClassFee: number;

  @ApiProperty({
    type: [Number],
    description: '기본급 (단위: 원)',
    example: [800000, 1000000],
  })
  basePay: number[] = null;

  @ApiProperty({
    type: [Number],
    description: '수업 단가 (단위: 원)',
    example: [50000, 65000],
  })
  classPay: number[] = null;

  @ApiProperty({
    type: [Number],
    description: '수업료 분배(단위: %)',
    example: [40, 50],
  })
  classFee: number[] = null;

  @ApiProperty({
    type: [Number],
    description: '월급 (단위: 원)',
    example: [2000000, 2500000],
  })
  monthly: number[] = null;

  @ApiProperty({
    type: [Number],
    description: '시급 (단위: 원)',
    example: [20000, 30000],
  })
  hourly: number[] = null;

  @ApiProperty({
    type: [String],
    description: '4대 보험, 퇴직금',
    example: ['4대 보험'],
  })
  welfare: string[];

  @ApiProperty({
    type: [String],
    description: '지원자격',
    example: ['신입 지원 가능'],
  })
  qualification: string[];

  @ApiProperty({
    type: [String],
    description: '우대사항',
    example: ['경력자', '생활체육지도사 자격증'],
  })
  preference: string[];

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    description: '채용 사이트',
    example: {
      호호스포: ['url1'],
      알바몬: ['url2', 'url2'],
    },
  })
  @ApiProperty({
    type: [String],
    description: '채용 사이트',
    example: ['잡코리아'],
  })
  site: Record<string, string[]>;

  @ApiProperty({
    type: String,
    description: '상세 설명',
    example:
      'https://www.jobkorea.co.kr/Recruit/GI_Read/46253705?rPageCode=SL&logpath=21&sn=6',
  })
  description: string = null;

  @ApiProperty({
    type: [String],
    description: '이미지 파일 url',
    example: [
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/헬스보이짐 배곧점 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_001.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/헬스보이짐 배곧점 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_002.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/헬스보이짐 배곧점 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_003.png',
    ],
  })
  image: string[] = null;

  @ApiProperty({
    type: Date,
    description: '최근 공고 게시일',
    example: '2025-01-09',
  })
  date: Date;

  @ApiProperty({
    type: Boolean,
    description: '채용 중 여부  \ntrue: 채용 중  \n1: 만료',
    example: true,
  })
  isHiring: boolean;

  @ApiProperty({
    type: Number,
    description: '조회수',
    example: 10,
  })
  view: number = 0;

  @ApiProperty({
    type: Number,
    description:
      '지원 방법  \n0: 앱 내 지원  \n1: 앱 내 지원 & 이메일+문자 지원',
    example: 1,
  })
  apply: number = null;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
    description: '연락 정보 (이메일, 전화번호)',
    example: {
      email: 'sample@email.com',
      phone: '000-0000-0000',
    },
  })
  contact: Record<string, string> = null;

  @ApiProperty({
    type: Boolean,
    description: '즐겨찾기 등록 여부',
    example: true,
  })
  bookmarked: boolean = false;

  constructor(recruitment: RecruitmentEntity, bookmarked?: boolean) {
    this.id = recruitment.id;
    this.centerName = recruitment.centerName;
    this.city = recruitment.city;
    this.location = recruitment.location;
    this.address = recruitment.address;
    this.workType = recruitment.workType;
    this.workTime = recruitment.workTime;

    const weekendDutyMap = {
      0: '명시 안 됨',
      1: '있음',
      2: '없음',
      3: '채용 공고 참고',
    };
    this.weekendDuty = weekendDutyMap[recruitment.weekendDuty];

    const genderMap = {
      0: '명시 안 됨',
      1: '성별 무관',
      2: '남성',
      3: '여성',
    };
    this.gender = genderMap[recruitment.gender];

    this.salary = recruitment.salary;
    this.maxClassFee = recruitment.maxClassFee;
    this.basePay = recruitment.basePay;
    this.classPay = recruitment.classPay;
    this.classFee = recruitment.classFee;
    this.monthly = recruitment.monthly;
    this.hourly = recruitment.hourly;
    this.welfare = recruitment.welfare;
    this.qualification = recruitment.qualification;
    this.preference = recruitment.preference;
    this.site = recruitment.site;
    this.description = recruitment.description;
    this.image = recruitment.image;
    this.date = recruitment.date;

    if (recruitment.isHiring) {
      this.isHiring = true;
    } else {
      this.isHiring = false;
    }

    if (recruitment.center) {
      this.apply = recruitment.apply;
      this.contact = {
        email: recruitment.center.email,
        phone: recruitment.center.phone,
      };
    }

    if (bookmarked) {
      this.bookmarked = true;
    }
  }
}
