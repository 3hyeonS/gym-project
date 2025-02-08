import { ApiProperty } from '@nestjs/swagger';
import { GymEntity } from '../entity/gyms.entity';
import { ExpiredGymEntity } from '../entity/expiredGyms.entity';

export class GymResponseDto {
  @ApiProperty({
    type: Number,
    description: 'id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: '센터명',
    example: '헬스보이짐 배곧점',
  })
  centerName: string;

  @ApiProperty({
    type: String,
    description: '시/도',
    example: '경기',
  })
  city: string;

  @ApiProperty({
    type: [String],
    description: '시/군/구',
    example: ['시흥시'],
  })
  location: string[];

  @ApiProperty({
    type: [String],
    description: '인근 지하철역',
    example: ['오이도역'],
  })
  subway: string[];

  @ApiProperty({
    type: [String],
    description: '근무 형태',
    example: ['정규직'],
  })
  workType: string[];

  @ApiProperty({
    type: [String],
    description: '근무 시간',
    example: ['오전', '오후'],
  })
  workTime: string[];

  @ApiProperty({
    type: [String],
    description: '근무일 수',
    example: ['주5일'],
  })
  workDays: string[];

  @ApiProperty({
    type: [String],
    description: '주말 당직',
    example: ['있음'],
  })
  weekendDuty: string[];

  @ApiProperty({
    type: [String],
    description: '급여 조건',
    example: ['기본급', '인센티브'],
  })
  salary: string[];

  @ApiProperty({
    type: [Number],
    description: '기본급 (단위: 만 원)',
    example: [80, 100],
  })
  basePay: number[];

  @ApiProperty({
    type: [Number],
    description: '수업 단가 (단위: 만 원)',
    example: [5, 6.5],
  })
  classPay: number[];

  @ApiProperty({
    type: [Number],
    description: '수업료 분배(단위: %)',
    example: [40, 50],
  })
  classFee: number[];

  @ApiProperty({
    type: [Number],
    description: '시급 (단위: 만 원)',
    example: [2, 3],
  })
  hourly: number[];

  @ApiProperty({
    type: [Number],
    description: '월급 (단위: 만 원)',
    example: [200, 250],
  })
  monthly: number[];

  @ApiProperty({
    type: Number,
    description: '최대 수업료(%)  \n채용공고참고 : -1  \n명시 안 됨 : -2',
    example: -1,
  })
  maxClassFee: number;

  @ApiProperty({
    type: [String],
    description: '성별',
    example: ['명시 안 됨'],
  })
  gender: string[];

  @ApiProperty({
    type: [String],
    description: '지원자격',
    example: ['명시 안 됨'],
  })
  qualifications: string[];

  @ApiProperty({
    type: [String],
    description: '우대사항',
    example: ['경력자', '생활체육지도사 자격증'],
  })
  preference: string[];

  @ApiProperty({
    type: [String],
    description: '채용 사이트',
    example: ['잡코리아'],
  })
  site: string[];

  @ApiProperty({
    type: Date,
    description: '최근 공고 게시일',
    example: '2025-01-09',
  })
  date: Date;

  @ApiProperty({
    type: String,
    description: '상세 설명',
    example:
      'https://www.jobkorea.co.kr/Recruit/GI_Read/46253705?rPageCode=SL&logpath=21&sn=6',
  })
  description: string;

  @ApiProperty({
    type: [String],
    description: '이미지 파일 url',
    example: [
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/헬스보이짐 배곧점 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_001.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/헬스보이짐 배곧점 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_002.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/헬스보이짐 배곧점 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_003.png',
    ],
  })
  image: string[];

  constructor(gym: GymEntity | ExpiredGymEntity) {
    this.id = gym.id;
    this.centerName = gym.centerName;
    this.city = gym.city;
    this.location = gym.location;
    this.subway = gym.subway;
    this.workType = gym.workType;
    this.workTime = gym.workTime;
    this.workDays = gym.workDays;
    this.weekendDuty = gym.weekendDuty;
    this.salary = gym.salary;
    this.basePay = gym.basePay;
    this.classPay = gym.classPay;
    this.classFee = gym.classFee;
    this.hourly = gym.hourly;
    this.monthly = gym.monthly;
    this.maxClassFee = gym.maxClassFee;
    this.gender = gym.gender;
    this.qualifications = gym.qualifications;
    this.preference = gym.preference;
    this.site = gym.site;
    this.date = gym.date;
    this.description = gym.description;
    this.image = gym.image;
  }
}
