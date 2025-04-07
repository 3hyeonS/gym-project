import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TWeekendDuty {
  YES = '있음',
  NO = '없음',
}

export enum TGender {
  BOTH = '성별 무관',
  MALE = '남성',
  FEMALE = '여성',
}

export class RecruitmentRegisterRequestDto {
  @ApiProperty({
    type: [String],
    description: '근무 형태',
    example: ['정규직', '프리랜서'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  workType: string[];

  @ApiProperty({
    type: [String],
    description: '근무 시간',
    example: ['오전~오후 풀타임', '자유 근무'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  workTime: string[];

  @ApiProperty({
    enum: TWeekendDuty,
    description: '주말 당직(있음 or 없음)',
    example: TWeekendDuty.YES,
  })
  @IsNotEmpty()
  @IsEnum(TWeekendDuty, {
    message: 'weekendDuty must be 있음 or 없음 only',
  })
  weekendDuty: TWeekendDuty;

  @ApiProperty({
    enum: TGender,
    description: '성별(성별 무관 or 남성 or 여성)',
    example: TGender.BOTH,
  })
  @IsNotEmpty()
  @IsEnum(TGender, {
    message: 'gender must be 성별 무관, 남성 or 여성 only',
  })
  gender: TGender;

  @ApiProperty({
    type: [String],
    description: '급여 조건',
    example: ['기본급', '수업료', '인센티브'],
  })
  @IsNotEmpty()
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
    type: [String],
    description: '4대 보험, 퇴직금',
    example: ['4대 보험'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  welfare: string[] = ['없음'];

  @ApiProperty({
    type: [String],
    description: '지원자격',
    example: ['신입 지원 가능'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  qualification: string[] = ['없음'];

  @ApiProperty({
    type: [String],
    description: '우대사항',
    example: ['경력자', '체육 관련 자격증'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  preference: string[] = ['없음'];

  @ApiProperty({
    type: String,
    description: '상세 설명',
    example:
      '- *서울 강동구 강일동 머슬비치짐 구인공고**\n\n​\n\n안녕하세요 머슬비치짐 입니다.\n\n현재 250평 규모의 피트니스 센터를 운영중이며\n\n수업포화 상태로, 트레이너 선생님 모십니다.\n\n## 위치 : 서울 강동구 강일동 75-12 경서빌딩 3층\n\n​\n\n## 모집 부분\n\n[PT]\n\n근무시간 : 14시~23시\n\n기본급 : 100만원\n\n수업료 :  최소 30% 이상 (첫달 35%)\n\n매출 구간에 따른 수업료\n\n500만원 이상 수업료 40% ▶ 인센티브 3%\n\n700만원 이상 수업료 45% ▶ 인센티브 4%\n\n900만원 이상 수업료 50% ▶ 인센티브 5%\n\n#[#지원방법](https://search.daum.net/search?w=tot&DA=SHT&q=%EC%A7%80%EC%9B%90%EB%B0%A9%EB%B2%95)\n\nsim7975@naver.com 이력서 송부 후\n\n010-3389-8257로 문자 송부\n\n​\n\n문자양식 : 지원부분 / 이름 / 나이 /\n\nex) pt팀장 / 승호/38세',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    type: [String],
    description: '이미지 파일 url',
    example: [
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_001.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_002.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_003.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_004.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_005.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_006.png',
      'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_007.png',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image: string[];

  @ApiProperty({
    type: Number,
    description:
      '지원 방법  \n0: 앱 내 지원  \n1: 앱 내 지원 & 이메일+문자 지원',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1], { message: 'apply must be 0 or 1' })
  apply: number;
}
