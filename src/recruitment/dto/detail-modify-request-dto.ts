import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class DetailModifyRequestDto {
  @ApiProperty({
    type: String,
    description: '상세 설명',
    example:
      '- *서울 강동구 강일동 머슬비치짐 구인공고**\n\n안녕하세요 머슬비치짐 입니다.\n\n현재 250평 규모의 피트니스 센터를 운영중이며\n\n수업포화 상태로, 트레이너 선생님 모십니다.\n\n## 위치 : 서울 강동구 강일동 75-12 경서빌딩 3층\n\n## 모집 부분\n\n[PT]\n\n근무시간 : 14시~23시\n\n기본급 : 100만원\n\n수업료 :  최소 30% 이상 (첫달 35%)\n\n매출 구간에 따른 수업료\n\n500만원 이상 수업료 40% ▶ 인센티브 3%\n\n700만원 이상 수업료 45% ▶ 인센티브 4%\n\n900만원 이상 수업료 50% ▶ 인센티브 5%\n\n#[#지원방법](https://search.daum.net/search?w=tot&DA=SHT&q=%EC%A7%80%EC%9B%90%EB%B0%A9%EB%B2%95)\n\nsim7975@naver.com 이력서 송부 후\n\n010-3389-8257로 문자 송부\n\n문자양식 : 지원부분 / 이름 / 나이 /\n\nex) pt팀장 / 승호/38세',
  })
  @IsOptional()
  @IsString()
  description?: string;

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
  image?: string[];
}
