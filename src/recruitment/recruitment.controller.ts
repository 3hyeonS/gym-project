import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseMsg } from 'src/decorators/response-message-decorator';
import { ResponseTransformInterceptor } from 'src/interceptors/response-transform-interceptor';
import { ResponseDto } from '../response-dto';
import { GenericApiResponse } from 'src/decorators/generic-api-response-decorator';
import { PrimitiveApiResponse } from 'src/decorators/primitive-api-response-decorator';
import { SelectedOptionsRequestDto } from './dto/recruitment-dto/request-dto/selected-options-request-dto';
import { ErrorApiResponse } from 'src/decorators/error-api-response-decorator';
import { RecruitmentRegisterRequestDto } from './dto/recruitment-dto/request-dto/recruitment-register-request-dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/custom-role.guard';
import { Roles } from 'src/decorators/roles-decorator';
import { GetUser } from 'src/decorators/get-user-decorator';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RecruitmentsPageResponseDto } from './dto/recruitment-dto/response-dto/recruitments-page-response-dto';
import { NullApiResponse } from 'src/decorators/null-api-response-decorator';
import { MyRecruitmentsResponseDto } from './dto/recruitment-dto/response-dto/my-recruitments-response-dto';
import { ApplyConditionModifyRequestDto } from './dto/recruitment-dto/request-dto/apply-condition-modify-request-dto';
import { SalaryCondtionModifyRequestDto } from './dto/recruitment-dto/request-dto/salary-condition-modify-request-dto';
import { ApplyModifyRequestDto } from './dto/recruitment-dto/request-dto/apply-modify-request-dto';
import { DetailModifyRequestDto } from './dto/recruitment-dto/request-dto/detail-modify-request-dto';
import { NumRequestDto } from './dto/recruitment-dto/request-dto/num-request-dto';
import { IdRequestDto } from './dto/recruitment-dto/request-dto/id-request-dto';
import { GetOptionalUser } from 'src/decorators/get-optional-user-decorator';
import { OptionalAuthGuard } from 'src/auth/custom-option.guard';
import { DoubleIdRequestDto } from './dto/recruitment-dto/request-dto/double-id-request-dto';
import { ResumeisProposedResponseDto } from 'src/auth/dto/resume-dto/response-dto/resume-isProposed-response-dto';
import { RecruitmentListLocationResponseDto } from './dto/recruitment-dto/response-dto/recruitmentList-location-response-dto';
import { RecruitmentResponseDto } from './dto/recruitment-dto/response-dto/recruitment-response-dto';
import { UserEntity } from 'src/auth/entity/user/user.entity';
import { WeekendDutyModifyRequestDto } from './dto/recruitment-dto/request-dto/weekendDuty-modify-request-dto';
import { VillyResponseDto } from './dto/villy-dto/villy-response-dto';

@ApiTags('Recruitment')
@UseInterceptors(ResponseTransformInterceptor)
@ApiExtraModels(ResponseDto)
@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  //문자 출력
  @ApiOperation({
    summary: 'Welcome Recruitment 출력',
  })
  @PrimitiveApiResponse({
    status: 200,
    description: '문자 출력 성공',
    message: 'String printed successfully',
    type: 'string',
    example: 'Welcome Recruitment',
  })
  @ResponseMsg('String printed successfully')
  @Get()
  getHello(): string {
    return this.recruitmentService.getHello();
  }

  // 공고 총 개수 출력
  @ApiOperation({
    summary: '채용 공고 개수 출력',
  })
  @PrimitiveApiResponse({
    status: 200,
    description: '채용 공고 개수 출력 성공',
    message: 'Total number of recruitments printed successfully',
    type: 'number',
    example: 1015,
  })
  @ResponseMsg('Total number of recruitments printed successfully')
  @Get('getTotalNumber')
  async getTotalNumber(): Promise<number> {
    return await this.recruitmentService.getTotalNumber();
  }
  0;

  // 채용 공고 1개 불러오기(조회수 증가)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '채용 공고 1개 불러오기',
    description: '로그인 시 즐겨찾기 여부 반영',
  })
  @GenericApiResponse({
    status: 201,
    description: '채용 공고 불러오기 성공',
    message: 'Recruitment returned successfully',
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'id must be a number conforming to the specified constraints',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '해당 id의 공고를 찾을 수 없음',
    message: 'There is no recruitment for selected id',
    error: 'NotFoundException',
  })
  @ResponseMsg('Recruitment returned successfully')
  @UseGuards(OptionalAuthGuard)
  @Post('getOne')
  async getOne(
    @GetOptionalUser() user: UserEntity | CenterEntity | null,
    @Body() idRequestDto: IdRequestDto,
  ): Promise<RecruitmentResponseDto> {
    if (user instanceof UserEntity) {
      return await this.recruitmentService.getOne(idRequestDto.id, user);
    }
    return await this.recruitmentService.getOne(idRequestDto.id);
  }

  // 인기공고 불러오기(n개)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '인기 공고 불러오기(n개)',
    description: '로그인 시 즐겨찾기 여부 반영',
  })
  @GenericApiResponse({
    status: 201,
    description: '인기 공고 불러오기 성공',
    message: 'Popular recruitments returned successfully',
    isArray: true,
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('Popular recruitments returned successfully')
  @UseGuards(OptionalAuthGuard)
  @Post('poplular')
  async getPopular(
    @GetOptionalUser() user: UserEntity | CenterEntity | null,
    @Body() numRequestDto: NumRequestDto,
  ): Promise<RecruitmentResponseDto[]> {
    if (user instanceof UserEntity) {
      return await this.recruitmentService.getPopular(numRequestDto.num, user);
    }
    return await this.recruitmentService.getPopular(numRequestDto.num);
  }

  // 모든 공고 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '모든 채용 공고 불러오기',
    description: '로그인 시 즐겨찾기 여부 반영',
  })
  @GenericApiResponse({
    status: 200,
    description: '모든 채용 공고 불러오기 성공',
    message: 'All recruitments returned successfully',
    model: RecruitmentsPageResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('All recruitments returned successfully')
  @UseGuards(OptionalAuthGuard)
  @Get('getAll')
  async getAll(
    @GetOptionalUser() user: UserEntity | CenterEntity | null,
    @Query('page') page: number = 1, // 기본값 1
    @Query('limit') limit: number = 20, // 기본값 20
  ): Promise<{
    recruitmentList: RecruitmentResponseDto[];
    page: number;
    totalRecruitments: number;
    totalPages: number;
  }> {
    if (user instanceof UserEntity) {
      return this.recruitmentService.getAll(page, limit, user);
    }
    return this.recruitmentService.getAll(page, limit);
  }

  // 선택 조건에 맞는 채용 공고 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '조건에 맞는 채용 공고 불러오기',
    description: '로그인 시 즐겨찾기 여부 반영',
  })
  @GenericApiResponse({
    status: 201,
    description: '해당 조건의 채용 공고 불러오기 성공',
    message: 'Recruitments with selected conditions returned successfully',
    model: RecruitmentsPageResponseDto,
    isArray: true,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message:
      'selectedMaxClassFee must be a number conforming to the specified constraints',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('Recruitments with selected conditions returned successfully')
  @UseGuards(OptionalAuthGuard)
  @Post('selected')
  async searchSelected(
    @GetOptionalUser() user: UserEntity | CenterEntity | null,
    @Body() selectedOptionsDto: SelectedOptionsRequestDto,
    @Query('page') page: number = 1, // 기본값 1
    @Query('limit') limit: number = 20, // 기본값 20
  ): Promise<{
    recruitmentList: RecruitmentResponseDto[];
    page: number;
    totalRecruitments: number;
    totalPages: number;
  }> {
    if (user instanceof UserEntity) {
      return await this.recruitmentService.searchSelected(
        selectedOptionsDto,
        page,
        limit,
        user,
      );
    }
    return await this.recruitmentService.searchSelected(
      selectedOptionsDto,
      page,
      limit,
    );
  }

  // 채용 공고 등록 가능 여부 확인
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '채용 공고 등록 가능 여부 확인',
    description:
      'true: 등록 가능  \nfalse: 등록 불가능(이미 채용 중인 공고가 등록되어 있음)',
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '채용 공고 등록 가능 여부 확인 성공',
    message: 'Recruitment register availability confirmed successfully',
    type: 'boolean',
    example: true,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 등록 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Recruitment register availability confirmed successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('canRegisterRecruitment')
  async canRegisterRecruitment(
    @GetUser() center: CenterEntity,
  ): Promise<boolean> {
    return await this.recruitmentService.canRegisterRecruitment(center);
  }

  // 채용 공고 이미지 등록하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '채용 공고 이미지 등록하기',
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '채용 공고 이미지 등록 성공',
    message: 'Recruitment images uploaded successfully',
    type: 'string',
    isArray: true,
    example: 'urlexample',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 등록 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Recruitment images uploaded successfully')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '이미지 파일 업로드',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' }, // 여러 개의 파일 처리
          description: '이미지 파일 등록',
        },
      },
    },
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @UseInterceptors(FilesInterceptor('images', 10))
  @Post('uploadImages')
  async uploadImages(
    @GetUser() center: CenterEntity,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string[]> {
    return await this.recruitmentService.uploadImages(center, files);
  }

  //채용 공고 등록하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '채용 공고 등록하기',
    description: 'body 조건 Schema 클릭해서 각 필드별로 확인',
  })
  @GenericApiResponse({
    status: 201,
    description: '채용 공고 등록 성공',
    message: 'Hiring recruitment registered successfully',
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message:
      'maxClassFee must be a number conforming to the specified constraints',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 등록 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '이미 등록된 채용 중 공고가 있음',
    message: 'Your hiring recruitment already exists',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Hiring recruitment registered successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('registerRecruitment')
  async registerRecruitment(
    @GetUser() center: CenterEntity,
    @Body() recruitmentRegisterRequestDto: RecruitmentRegisterRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const registeredRecruitment =
      await this.recruitmentService.registerRecruitment(
        center,
        recruitmentRegisterRequestDto,
      );
    return registeredRecruitment;
  }

  // 내 모든 공고 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 모든 공고 불러오기',
    description: 'hiring: 채용 중 공고  \nexpired: 만료된 공고',
  })
  @GenericApiResponse({
    status: 200,
    description: '내 모든 공고 불러오기 성공',
    message: 'My all recruitments returned successfully',
    model: MyRecruitmentsResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 불러오기 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('My all recruitments returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Get('getMyAll')
  async getMyAll(
    @GetUser() center: CenterEntity,
  ): Promise<MyRecruitmentsResponseDto> {
    const { myRecruitment, hiringApply } =
      await this.recruitmentService.getMyRecruitment(center);
    const { myExpiredRecruitments, expiredApplies } =
      await this.recruitmentService.getMyExpiredRecruitments(center);
    return new MyRecruitmentsResponseDto(
      myRecruitment,
      hiringApply,
      myExpiredRecruitments,
      expiredApplies,
    );
  }

  // 내 공고 1개 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 공고 1개 불러오기',
  })
  @GenericApiResponse({
    status: 201,
    description: '내 공고 1개 불러오기 성공',
    message: 'My Recruitment returned successfully',
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'id must be a number conforming to the specified constraints',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 불러오기 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '해당 id의 공고를 찾을 수 없음',
    message: 'There is no recruitment for selected id',
    error: 'NotFoundException',
  })
  @ResponseMsg('My Recruitment returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('getMyOne')
  async getMyOne(
    @GetUser() center: CenterEntity,
    @Body() idRequestDto: IdRequestDto,
  ): Promise<RecruitmentResponseDto> {
    return await this.recruitmentService.getMyOneRecruitment(
      center,
      idRequestDto.id,
    );
  }

  // 주말당직 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '주말당직 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '주말당직 수정하기 성공',
    message: 'Weekend duty modified successfully',
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'weekendDuty must be 있음 or 없음 only',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 수정 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '채용 중인 공고가 없음',
    message: 'There is no hring recruitment',
    error: 'NotFoundException',
  })
  @ResponseMsg('Weekend duty modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('weekendDutyModify')
  async modifyWeekendDuty(
    @GetUser() center: CenterEntity,
    @Body() weekendDutyModifyRequestDto: WeekendDutyModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const modifiedRecruitment = await this.recruitmentService.modifyWeekendDuty(
      center,
      weekendDutyModifyRequestDto,
    );
    return modifiedRecruitment;
  }

  // 지원조건 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '지원조건 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '지원조건 수정하기 성공',
    message: 'Apply condition modified successfully',
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'gender must be 성별 무관, 남성 or 여성 only',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 수정 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '채용 중인 공고가 없음',
    message: 'There is no hring recruitment',
    error: 'NotFoundException',
  })
  @ResponseMsg('Apply condition modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('applyConditionModify')
  async modifyApplyCondition(
    @GetUser() center: CenterEntity,
    @Body() applyConditionModifyRequestDto: ApplyConditionModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const modifiedRecruitment =
      await this.recruitmentService.modifyApplyCondition(
        center,
        applyConditionModifyRequestDto,
      );
    return modifiedRecruitment;
  }

  // 급여조건 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '급여조건 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '급여조건 수정하기 성공',
    message: 'Salary condition modified successfully',
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'salary should not be empty',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 수정 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '채용 중인 공고가 없음',
    message: 'There is no hring recruitment',
    error: 'NotFoundException',
  })
  @ResponseMsg('Salary condition modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('salaryConditionModify')
  async modifySalaryCondition(
    @GetUser() center: CenterEntity,
    @Body() salaryCondtionModifyRequestDto: SalaryCondtionModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const modifiedRecruitment =
      await this.recruitmentService.modifySalaryCondition(
        center,
        salaryCondtionModifyRequestDto,
      );
    return modifiedRecruitment;
  }

  // 지원방법 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '지원방법 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '지원방법 수정하기 성공',
    message: 'Apply modified successfully',
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'apply must be 0 or 1',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 수정 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '채용 중인 공고가 없음',
    message: 'There is no hring recruitment',
    error: 'NotFoundException',
  })
  @ResponseMsg('Apply condition modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('applyModify')
  async modifyApply(
    @GetUser() center: CenterEntity,
    @Body() applyModifyRequestDto: ApplyModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const modifiedRecruitment = await this.recruitmentService.modifyApply(
      center,
      applyModifyRequestDto,
    );
    return modifiedRecruitment;
  }

  // 상세요강 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '상세요강 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '상세요강 수정하기 성공',
    message: 'Detail modified successfully',
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'description must be a string',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 수정 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '채용 중인 공고가 없음',
    message: 'There is no hring recruitment',
    error: 'NotFoundException',
  })
  @ResponseMsg('Detail condition modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('detailModify')
  async modifyDetail(
    @GetUser() center: CenterEntity,
    @Body() detailModifyRequestDto: DetailModifyRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const modifiedRecruitment = await this.recruitmentService.modifyDetail(
      center,
      detailModifyRequestDto,
    );
    return modifiedRecruitment;
  }

  // 내 채용 중 공고 끌어올리기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 채용 중 공고 끌어올리기',
  })
  @NullApiResponse({
    status: 200,
    description: '공고 끌어올리기 성공',
    message: 'Hiring recruitment refreshed successfully',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 끌어올리기 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 403,
    description:
      '오늘 공고가 이미 업데이트 됨(공고 끌어올리기는 하루 한 번만 가능)  \n공고 등록도 업데이트로 취급됨',
    message: 'You already updated recruitment today',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '채용 중인 공고가 없음',
    message: 'There is no hiring recruitment',
    error: 'NotFoundException',
  })
  @ResponseMsg('Hiring recruitment refreshed successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Get('refresh')
  async refreshMyRecruitment(@GetUser() center: CenterEntity): Promise<void> {
    await this.recruitmentService.refreshMyRecruitment(center);
  }

  // 내 채용 중 공고 만료시키기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 채용 중 공고 만료시키기',
  })
  @NullApiResponse({
    status: 200,
    description: '공고 만료시키기 성공',
    message: 'Hiring recruitment expired successfully',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 만료 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '채용 중 공고가 없음',
    message: 'There is no Hiring recruitment',
    error: 'NotFoundException',
  })
  @ResponseMsg('Hiring recruitment expired successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Get('expire')
  async expireMyRecruitment(@GetUser() center: CenterEntity): Promise<void> {
    await this.recruitmentService.expireMyRecruitment(center);
  }

  // 공고 삭제하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '공고 삭제하기',
  })
  @NullApiResponse({
    status: 201,
    description: '공고 삭제 성공',
    message: 'Recruitment deleted successfully',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 삭제 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '해당 id의 공고를 찾을 수 없음',
    message: 'There is no recruitment for selected id',
    error: 'NotFoundException',
  })
  @ResponseMsg('Hiring recruitment deleted successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('delete')
  async deleteRecruitment(
    @GetUser() center: CenterEntity,
    @Body() idRequestDto: IdRequestDto,
  ): Promise<void> {
    await this.recruitmentService.deleteRecruitment(center, idRequestDto.id);
  }

  // 채용공고 저장 or 해제
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '채용공고 저장/해제',
  })
  @NullApiResponse({
    status: 201,
    description: '채용공고 저장/해제 성공',
    message: 'Bookmark (de-)registered successfully',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'id should not be empty',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '유저 회원이 아님 (유저 회원만 채용공고 저장/해제 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '해당 id의 공고를 찾을 수 없음',
    message: 'There is no recruitment for selected id',
    error: 'NotFoundException',
  })
  @ResponseMsg('Bookmark (de-)registered successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('registerBookmark')
  async registerBookmark(
    @GetUser() user: UserEntity,
    @Body() idRequestDto: IdRequestDto,
  ): Promise<void> {
    await this.recruitmentService.registerBookmark(user, idRequestDto.id);
  }

  // 저장한 공고 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '저장한 공고 불러오기',
  })
  @GenericApiResponse({
    status: 200,
    description: '저장한 공고 불러오기 성공',
    message: 'Bookmarked recruitments returned successfully',
    isArray: true,
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '유저 회원이 아님 (유저 회원만 저장한 공고 불러오기 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Bookmarked recruitments returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Get('getBookmared')
  async getBookmarked(
    @GetUser() user: UserEntity,
  ): Promise<RecruitmentResponseDto[]> {
    return await this.recruitmentService.getBookmarked(user);
  }

  // 지원하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '지원하기',
  })
  @NullApiResponse({
    status: 201,
    description: '지원하기 성공',
    message: 'Applied successfully',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'id should not be empty',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '유저 회원이 아님 (유저 회원만 지원하기 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '이미 지원함',
    message: 'You already applied',
    error: 'ConflictException',
  })
  @ResponseMsg('Applied successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('apply')
  async apply(
    @GetUser() user: UserEntity,
    @Body() idRequestDto: IdRequestDto,
  ): Promise<void> {
    await this.recruitmentService.apply(user, idRequestDto.id);
  }

  // 지원한 공고 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '지원한 공고 불러오기',
  })
  @GenericApiResponse({
    status: 200,
    description: '지원한 공고 불러오기 성공',
    message: 'Applied recruitments returned successfully',
    isArray: true,
    model: RecruitmentResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '유저 회원이 아님 (유저 회원만 지원한 공고 불러오기 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Applied recruitments returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Get('getAppliedRecruitments')
  async getAppliedRecruitments(
    @GetUser() user: UserEntity,
  ): Promise<RecruitmentResponseDto[]> {
    return await this.recruitmentService.getAppliedRecruitments(user);
  }

  // 지원받은 이력서 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '지원받은 이력서 불러오기',
  })
  @GenericApiResponse({
    status: 201,
    description: '지원한 이력서 불러오기 성공',
    message: 'Applied resume returned successfully',
    isArray: true,
    model: ResumeisProposedResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 지원한 이력서 불러오기 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Applied resume returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('getAppliedResumes')
  async getAppliedResumes(
    @Body() idRequestDto: IdRequestDto,
  ): Promise<ResumeisProposedResponseDto[]> {
    return await this.recruitmentService.getAppliedResumes(idRequestDto.id);
  }

  // 면접 제안하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '면접 제안하기',
  })
  @NullApiResponse({
    status: 201,
    description: '면접 제안하기 성공',
    message: 'Interview proposed successfully',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'resumeid should not be empty',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 면접 제안하기 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '이미 면접을 제안함',
    message: 'You already proposed interview',
    error: 'ConflictException',
  })
  @ResponseMsg('Interview proposed successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('proposeInterview')
  async proposeInterview(
    @Body() doubleIdRequestDto: DoubleIdRequestDto,
  ): Promise<void> {
    await this.recruitmentService.proposeInterview(
      doubleIdRequestDto.recruitmentId,
      doubleIdRequestDto.resumeId,
    );
  }

  // 내 주변 공고 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 주변 공고 불러오기',
    description:
      '이력서 기준, 비로그인 및 이력서 미보유 시 강남구로 설정  \n로그인 시 즐겨찾기 여부 반영',
  })
  @GenericApiResponse({
    status: 201,
    description: '내 주변 공고 불러오기 성공',
    message: 'Nearby recruitments returned successfully',
    model: RecruitmentListLocationResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'num should not be empty',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('Nearby recruitments returned successfully')
  @UseGuards(OptionalAuthGuard)
  @Post('getNearby')
  async getNearby(
    @GetOptionalUser() user: UserEntity | CenterEntity | null,
    @Body() numRequestDto: NumRequestDto,
  ): Promise<RecruitmentListLocationResponseDto> {
    if (user) {
      return await this.recruitmentService.getNearby(numRequestDto.num, user);
    }
    return await this.recruitmentService.getNearby(numRequestDto.num);
  }

  // 빌리
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '빌리 불러오기',
  })
  @GenericApiResponse({
    status: 200,
    description: '빌리 불러오기 성공',
    message: 'Villies returned successfully',
    isArray: true,
    model: VillyResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '유저 회원이 아님 (유저 회원만 빌리 불러오기 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Villies returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Get('getVillies')
  async getVillies(@GetUser() user: UserEntity): Promise<VillyResponseDto[]> {
    return await this.recruitmentService.getVillies(user);
  }

  // 새로운 매칭
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '새로운 매칭',
  })
  @GenericApiResponse({
    status: 200,
    description: '새로운 매칭 성공',
    message: 'New recruitment matched successfully',
    isArray: true,
    model: VillyResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '유저 회원이 아님 (유저 회원만 새로운 매칭 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '하루 세번 제한',
    message: 'Already matched three times today',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '이력서에 적합한 채용공고가 더 이상 없음',
    message: 'There is no more recruitment for your resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('New recruitment matched successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Get('getNewMatching')
  async getNewMatching(
    @GetUser() user: UserEntity,
  ): Promise<VillyResponseDto[]> {
    return await this.recruitmentService.getNewMatching(user);
  }

  // 노션 공고 업데이트
  // @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '노션 공고 업데이트',
  })
  @NullApiResponse({
    status: 200,
    description: '노션 공고 업데이트 성공',
    message: 'Notion recruitments updated successfully',
  })
  // @ErrorApiResponse({
  //   status: 401,
  //   description: '유효하지 않거나 기간이 만료된 acccessToken',
  //   message: 'Invalid or expired accessToken',
  //   error: 'UnauthorizedException',
  // })
  // @ErrorApiResponse({
  //   status: 403,
  //   description: '관리자 회원이 아님 (관리자 회원만 노션 공고 업데이트 가능)',
  //   message: 'Not a member of the ADMIN (only ADMIN can call this api)',
  //   error: 'ForbiddenException',
  // })
  @ResponseMsg('Notion recruitments updated successfully')
  // @UseGuards(AuthGuard(), RolesGuard)
  // @Roles('ADMIN')
  @Get('notionRecruitmentsUpdate')
  async notionRecruitmentsUpdate() // @GetUser() user: UserEntity,
  : Promise<void> {
    await this.recruitmentService.notionRecruitmentsUpdate();
  }
}
