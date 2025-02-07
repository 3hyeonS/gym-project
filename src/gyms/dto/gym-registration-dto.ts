import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GymRegisterRequestDto {
  @ApiProperty({
    type: [String],
    description: '근무 형태',
    example: ['정규직'],
  })
  @IsArray()
  @IsString({ each: true })
  workType: string[];

  @ApiProperty({
    type: [String],
    description: '근무 시간',
    example: ['오후'],
  })
  @IsArray()
  @IsString({ each: true })
  workTime: string[];

  @ApiProperty({
    type: [String],
    description: '근무일 수',
    example: ['주5일'],
  })
  @IsArray()
  @IsString({ each: true })
  workDays: string[];

  @ApiProperty({
    type: [String],
    description: '주말 당직',
    example: ['명시 안 됨'],
  })
  @IsArray()
  @IsString({ each: true })
  weekendDuty: string[];

  @ApiProperty({
    type: [String],
    description: '급여 조건',
    example: ['기본급', '수업료', '인센티브', '퇴직금', '4대 보험'],
  })
  @IsArray()
  @IsString({ each: true })
  salary: string[];

  @ApiProperty({
    type: [Number],
    description: '기본급 (단위: 만 원), [최저, 최대]',
    example: [80, 100],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  basePay: number[];

  @ApiProperty({
    type: [Number],
    description: '수업 단가 (단위: 만 원), [최저, 최대]',
    example: [5, 6.5],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  classPay: number[];

  @ApiProperty({
    type: [Number],
    description: '수업료 분배(단위: %), [최저, 최대]',
    example: [40, 50],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  classFee: number[];

  @ApiProperty({
    type: [Number],
    description: '시급 (단위: 만 원), [최저, 최대]',
    example: [2, 3],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  hourly: number[];

  @ApiProperty({
    type: [Number],
    description: '월급 (단위: 만 원), [최저, 최대]',
    example: [200, 250],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2) // 최소 크기 2
  @ArrayMaxSize(2) // 최대 크기 2
  @IsNumber({}, { each: true }) // 배열 내 각 요소가 숫자인지 확인
  monthly: number[];

  @ApiProperty({
    type: [String],
    description: '성별',
    example: ['명시 안 됨'],
  })
  @IsArray()
  @IsString({ each: true })
  gender: string[];

  @ApiProperty({
    type: [String],
    description: '지원자격',
    example: ['명시 안 됨'],
  })
  @IsArray()
  @IsString({ each: true })
  qualifications: string[];

  @ApiProperty({
    type: [String],
    description: '우대사항',
    example: ['경력자', '체육 관련 자격증'],
  })
  @IsArray()
  @IsString({ each: true })
  preference: string[];

  @ApiProperty({
    type: String,
    description: '상세 설명',
    example:
      '- *서울 강동구 강일동 머슬비치짐 구인공고**\n\n​\n\n안녕하세요 머슬비치짐 입니다.\n\n현재 250평 규모의 피트니스 센터를 운영중이며\n\n수업포화 상태로, 트레이너 선생님 모십니다.\n\n## 위치 : 서울 강동구 강일동 75-12 경서빌딩 3층\n\n​\n\n## 모집 부분\n\n[PT]\n\n근무시간 : 14시~23시\n\n기본급 : 100만원\n\n수업료 :  최소 30% 이상 (첫달 35%)\n\n매출 구간에 따른 수업료\n\n500만원 이상 수업료 40% ▶ 인센티브 3%\n\n700만원 이상 수업료 45% ▶ 인센티브 4%\n\n900만원 이상 수업료 50% ▶ 인센티브 5%\n\n#[#지원방법](https://search.daum.net/search?w=tot&DA=SHT&q=%EC%A7%80%EC%9B%90%EB%B0%A9%EB%B2%95)\n\nsim7975@naver.com 이력서 송부 후\n\n010-3389-8257로 문자 송부\n\n​\n\n문자양식 : 지원부분 / 이름 / 나이 /\n\nex) pt팀장 / 승호/38세',
  })
  @IsOptional()
  @IsString()
  description: string;
}
