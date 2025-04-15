import { ApiProperty } from '@nestjs/swagger';
import { CareerDto } from './career-dto';
import { AcademyDto } from './academy-dto';
import { QualificationDto } from './qualification-dto';
import { ResumeEntity } from '../entity/resume.entity';

export class ResumeResponseDto {
  @ApiProperty({
    type: Number,
    description: 'id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: '증명사진',
    example: 'url',
  })
  profileImage: string;

  @ApiProperty({
    type: String,
    description: '이름',
    example: '홍길동',
  })
  name: string;

  @ApiProperty({
    type: Date,
    description: '생년월일',
    example: '1999-03-17',
  })
  birth: string;

  @ApiProperty({
    type: String,
    description: '전화번호',
    example: '010-0000-0000',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: '이메일',
    example: 'sample@email.com',
  })
  email: string;

  @ApiProperty({
    type: Number,
    description: '성별  \n0: 남성  \n1: 여성',
    example: 1,
  })
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
  location: Record<string, string[]>;

  @ApiProperty({
    type: Number,
    description: '신입/경력 여부  \n0: 신입  \n1: 경력',
    example: 1,
  })
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
  careers?: CareerDto[] = null;

  @ApiProperty({
    type: [String],
    description: '근무 형태',
    example: ['정규직', '프리랜서'],
  })
  workType?: string[] = null;

  @ApiProperty({
    type: [String],
    description: '근무 시간',
    example: ['오전~오후 풀타임', '자유 근무'],
  })
  workTime?: string[] = null;

  @ApiProperty({
    type: AcademyDto,
    description: '학력 정보',
    example: {
      level: '대학교(4년제)',
      status: '졸업',
      detail: '서울대학교 체육교육과',
    },
  })
  academy?: AcademyDto = null;

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
  qualifications?: QualificationDto[] = null;

  @ApiProperty({
    type: [String],
    description: '수상 내역',
    example: ['2026 ABCD 피지크 2위'],
  })
  award?: string[] = null;

  @ApiProperty({
    type: String,
    description: 'SNS',
    example: 'url',
  })
  SNS?: string = null;

  @ApiProperty({
    type: String,
    description: '포트폴리오 파일',
    example: 'url',
  })
  portfolioFile?: string = null;

  @ApiProperty({
    type: [String],
    description: '포트폴리오 이미지',
    example: ['url1', 'url2'],
  })
  portfolioImages?: string[] = null;

  @ApiProperty({
    type: String,
    description: '자기소개(500자 이내)',
    example: '안녕하세요, 홍길동입니다.',
  })
  introduction?: string = null;

  constructor(resume: ResumeEntity) {
    this.id = resume.id;
    this.profileImage = resume.profileImage;
    this.name = resume.name;
    this.birth =
      resume.birth instanceof Date
        ? resume.birth.toISOString().split('T')[0]
        : resume.birth;
    this.phone = resume.phone;
    this.email = resume.email;
    this.gender = resume.gender;
    this.location = resume.location;
    this.isNew = resume.isNew;

    if (resume.careers) {
      this.careers = resume.careers.map((career) => new CareerDto(career));
    } else {
      this.careers = resume.careers;
    }

    this.workType = resume.workType;
    this.workTime = resume.workTime;

    this.academy = resume.academy;
    if (resume.academy) {
      this.academy = new AcademyDto(resume.academy);
    } else {
      this.academy = resume.academy;
    }

    if (resume.qualifications) {
      this.qualifications = resume.qualifications.map(
        (qualifiaction) => new QualificationDto(qualifiaction),
      );
    } else {
      this.qualifications = resume.qualifications;
    }

    this.qualifications = resume.qualifications;
    this.award = resume.award;
    this.SNS = resume.SNS;
    this.portfolioFile = resume.portfolioFile;
    this.portfolioImages = resume.portfolioImages;
    this.introduction = resume.introduction;
  }
}
