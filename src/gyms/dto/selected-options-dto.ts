import { ApiProperty } from "@nestjs/swagger";

export class SelectedOptionsDto {
    @ApiProperty({
        type: [Number],
        description: '명시 안 됨, 채용공고 참고, 성별 무관에 대한 옵션 체크 여부  \n순서: 근무 형태, 근무 시간, 근무일 수 , 주말 당직, 급여 조건, 최대 수업료, 성별, 지원자격, 우대사항  \n0 : 포함하지 않음  \n1: 모두 포함',
        example: [0, 1, 0, 1, 1, 0, 1, 1, 1],
        default: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    })
    flexibleOptions: number[];
    
    @ApiProperty({
        type: 'object',
        additionalProperties: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        description: '시/도 및 시/군/구',
        example: {
            '서울': ['강동구', '송파구'],
            '경기': ['성남시 분당구', '고양시 덕양구']
        }
    })
    selectedLocation: Record<string, string[]>;
    
    @ApiProperty({
        type: [String],
        description: '근무 형태',
        example: ['정규직', '계약직']
    })
    selectedWorkType: string[];
    
    @ApiProperty({
        type: [String],
        description: '근무 시간',
        example: ['오전', '오후']
    })
    selectedWorkTime: string[];
    
    @ApiProperty({
        type: [String],
        description: '근무일 수',
        example: ['주5일', '주3일']
    })
    selectedWorkDays: string[]
    
    @ApiProperty({
        type: [String],
        description: '주말 당직',
        example: ['있음', '없음']
    })
    selectedWeekendDuty: string[];
    
    @ApiProperty({
        type: [String],
        description: '급여 조건',
        example: ['기본급', '인센티브']
    })
    selectedSalary: string[];
    
    @ApiProperty({
        type: Number,
        description: '최대 수업료(%)  \n채용공고참고 : -1  \n명시 안 됨 : -2',
        example: 50
    })
    selectedMaxClassFee: number;
    
    @ApiProperty({
        type: [String],
        description: '성별',
        example: ['성별무관', '여성']
    })
    selectedGender: string[];
    
    @ApiProperty({
        type: [String],
        description: '지원자격',
        example: ['신입 지원 가능', '체육 관련 자격증']
    })
    selectedQualifications: string[];
    
    @ApiProperty({
        type: [String],
        description: '우대사항',
        example: ['생활체육지도사 자격증', '경력자'],
    })
    selectedPreference: string[];

}