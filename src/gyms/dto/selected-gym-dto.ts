import { ApiProperty } from "@nestjs/swagger";
import { GymEntity } from "../entity/gyms.entity";

export class searchedGymDto implements GymEntity{   
    @ApiProperty({
        type: Number,
        description: 'id',
        example: 635
    })
    id: number;

    @ApiProperty({
        type: String,
        description: '센터명',
        example: '머슬비치짐'
    })
    centerName: string;

    @ApiProperty({
        type: String,
        description: '시/도',
        example: '서울'
    })
    city: string;

    @ApiProperty({
        type: [String],
        description: '시/군/구',
        example: ['강동구']
    })
    location: string[];

    @ApiProperty({
        type: [String],
        description: '인근 지하철역',
        example: ['강일역']
    })
    subway: string[];

    @ApiProperty({
        type: [String],
        description: '근무 형태',
        example: ['정규직']
    })
    workType: string[];

    @ApiProperty({
        type: [String],
        description: '근무 시간',
        example: ['오후']
    })
    workTime: string[];

    @ApiProperty({
        type: [String],
        description: '근무일 수',
        example: ['주5일']
    })
    workDays: string[];

    @ApiProperty({
        type: [String],
        description: '주말 당직',
        example: ['명시 안 됨']
    })
    weekendDuty: string[];

    @ApiProperty({
        type: [String],
        description: '급여 조건',
        example: ['기본급', '인센티브', '퇴직금', '4대 보험']
    })
    salary: string[];

    @ApiProperty({
        type: Number,
        description: '최대 수업료(%)  \n채용공고참고 : -1  \n명시 안 됨 : -2',
        example: 60
    })
    maxClassFee: number;

    @ApiProperty({
        type: [String],
        description: '성별',
        example: ['명시 안 됨']
    })
    gender: string[];

    @ApiProperty({
        type: [String],
        description: '지원자격',
        example: ['명시 안 됨']
    })
    qualifications: string[];

    @ApiProperty({
        type: [String],
        description: '우대사항',
        example: ['경력자', '체육 관련 자격증']
    })
    preference: string[];

    @ApiProperty({
        type: [String],
        description: '채용 사이트',
        example: ['오픈채팅방']
    })
    site: string[];

    @ApiProperty({
        type: Date,
        description: '최근 공고 게시일',
        example: ['2024-11-28']
    })
    date: Date;

    @ApiProperty({
        type: String,
        description: '상세 설명',
        example: '- *서울 강동구 강일동 머슬비치짐 구인공고**\n\n​\n\n안녕하세요 머슬비치짐 입니다.\n\n현재 250평 규모의 피트니스 센터를 운영중이며\n\n수업포화 상태로, 트레이너 선생님 모십니다.\n\n## 위치 : 서울 강동구 강일동 75-12 경서빌딩 3층\n\n​\n\n## 모집 부분\n\n[PT]\n\n근무시간 : 14시~23시\n\n기본급 : 100만원\n\n수업료 :  최소 30% 이상 (첫달 35%)\n\n매출 구간에 따른 수업료\n\n500만원 이상 수업료 40% ▶ 인센티브 3%\n\n700만원 이상 수업료 45% ▶ 인센티브 4%\n\n900만원 이상 수업료 50% ▶ 인센티브 5%\n\n#[#지원방법](https://search.daum.net/search?w=tot&DA=SHT&q=%EC%A7%80%EC%9B%90%EB%B0%A9%EB%B2%95)\n\nsim7975@naver.com 이력서 송부 후\n\n010-3389-8257로 문자 송부\n\n​\n\n문자양식 : 지원부분 / 이름 / 나이 /\n\nex) pt팀장 / 승호/38세'
    })
    description: string;

    @ApiProperty({
        type: [String],
        description: '이미지 파일',
        example: [
            'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_001.png',
            'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_002.png',
            'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_003.png',
            'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_004.png',
            'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_005.png',
            'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_006.png',
            'https://sehyeon-gym-images.s3.ap-northeast-2.amazonaws.com/images/머슬비치짐 14d5a73e57a080a3a04ae25f180d5857/KakaoTalk_Photo_2024-11-29-16-49-41_007.png'
        ]
    })
    image: string[];

}