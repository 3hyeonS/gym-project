import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CareerDto } from './career-dto';
import { AcademyDto } from './academy-dto';
import { QualificationDto } from './qualification-dto';

export class ResumeRegisterRequestDto {
  @ApiProperty({
    type: String,
    description: '증명사진 url(100자 이내)',
    example: 'url',
  })
  @IsNotEmpty()
  @Length(1, 100)
  @IsString()
  profileImage: string;

  @ApiProperty({
    type: String,
    description: '이름',
    example: '홍길동',
  })
  @IsNotEmpty() // null 값 체크
  @IsString()
  @Length(1, 20) // 문자 수
  name: string;

  @ApiProperty({
    type: Date,
    description: '생년월일',
    example: '1999-03-17',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  birth: Date;

  @ApiProperty({
    type: String,
    description: '전화번호(000-0000-0000 형식만 허용)',
    example: '010-0000-0000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{3}-\d{4}-\d{4}$/, {
    message: 'phone format must be 000-0000-0000',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: '이메일(이메일 형식만 허용)',
    example: 'sample@email.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail() // 이메일 형식
  @Length(1, 100)
  email: string;

  @ApiProperty({
    type: Number,
    description: '성별  \n0: 남성  \n1: 여성',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1], { message: 'apply must be 0 or 1' })
  gender: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    description: '시/도 및 시/군/구',
    example: {
      서울: ['강동구', '송파구'],
      경기: ['성남시 분당구', '고양시 덕양구'],
    },
  })
  @IsObject()
  @IsNotEmpty()
  location: Record<string, string[]>;

  @ApiProperty({
    type: Number,
    description: '신입/경력 여부  \n0: 신입  \n1: 경력',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1], { message: 'apply must be 0 or 1' })
  isNew: number;

  @ApiProperty({
    type: [CareerDto],
    description: '경력 사항',
    example: [
      {
        where: '헬스짐 강남점',
        start: '2020-01-01',
        end: '2022-12-31',
      },
      {
        where: 'PT 전문센터 분당점',
        start: '2023-01-01',
        end: '2024-03-01',
      },
    ],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CareerDto)
  careers?: CareerDto[];

  @ApiProperty({
    type: [String],
    description: '근무 형태',
    example: ['정규직', '프리랜서'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workType?: string[];

  @ApiProperty({
    type: [String],
    description: '근무 시간',
    example: ['오전~오후 풀타임', '자유 근무'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  workTime?: string[];

  @ApiProperty({
    type: AcademyDto,
    description: '학력 정보',
    example: {
      level: '대학교(4년제)',
      status: '졸업',
      detail: '서울대학교 체육교육과',
    },
  })
  @IsOptional()
  @Type(() => AcademyDto)
  academy?: AcademyDto;

  @ApiProperty({
    type: [QualificationDto],
    description: '자격증 정보',
    example: [
      {
        certificate: '생활스포츠지도사',
        level: '2급',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  qualifications?: QualificationDto[];

  @ApiProperty({
    type: [String],
    description: '수상 내역',
    example: ['2026 ABCD 피지크 2위'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  award?: string[];

  @ApiProperty({
    type: String,
    description: 'SNS url(100자 이내)',
    example: 'url',
  })
  @IsOptional()
  @Length(1, 100)
  @IsString()
  SNS?: string;

  @ApiProperty({
    type: String,
    description: '포트폴리오 파일 url(100자 이내)',
    example: 'url',
  })
  @IsOptional()
  @Length(1, 100)
  @IsString()
  portfolioFile?: string;

  @ApiProperty({
    type: [String],
    description: '포트폴리오 이미지 url',
    example: ['url1', 'url2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioImages?: string[];

  @ApiProperty({
    type: String,
    description: '자기소개(500자 이내)',
    example: '안녕하세요, 홍길동입니다.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  introduction?: string;
}
