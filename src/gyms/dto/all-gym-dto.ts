import { ApiProperty } from '@nestjs/swagger';
import { GymEntity } from '../entity/gyms.entity';

export class allGymDto implements GymEntity {
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
    description: '이미지 파일',
    example: [],
  })
  image: string[];
}
