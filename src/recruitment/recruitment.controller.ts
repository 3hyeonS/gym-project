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
import { RecruitmentResponseDto } from './dto/recruitment-response-dto';
import { ResponseMsg } from 'src/decorators/response-message-decorator';
import { ResponseTransformInterceptor } from 'src/interceptors/response-transform-interceptor';
import { ResponseDto } from '../response-dto';
import { GenericApiResponse } from 'src/decorators/generic-api-response-decorator';
import { PrimitiveApiResponse } from 'src/decorators/primitive-api-response-decorator';
import { SelectedOptionsDto } from './dto/selected-options-dto';
import { ErrorApiResponse } from 'src/decorators/error-api-response-decorator';
import { RecruitmentRegisterRequestDto } from './dto/recruitment-registration-request-dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/custom-role.guard';
import { Roles } from 'src/decorators/roles-decorator';
import { GetUser } from 'src/decorators/get-user-decorator';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RecruitmentsPageResponseDto } from './dto/recruitments-page-response-dto';
import { NullApiResponse } from 'src/decorators/null-api-response-decorator';
import { GetMyRecruitmentsResponseDto } from './dto/get-my-recruitments-response-dto';
import { IdRequestDto } from './dto/id-request-dto';

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

  // 모든 헬스장 불러오기
  @ApiOperation({
    summary: '모든 채용 공고 불러오기',
  })
  @GenericApiResponse({
    status: 200,
    description: '모든 채용 공고 불러오기 성공',
    message: 'All recruitments returned successfully',
    model: RecruitmentsPageResponseDto,
  })
  @ResponseMsg('All recruitments returned successfully')
  @Get('getAll')
  async getAll(
    @Query('page') page: number = 1, // 기본값 1
    @Query('limit') limit: number = 20, // 기본값 20
  ): Promise<{
    recruitmentsList: RecruitmentResponseDto[];
    page: number;
    totalRecruitments: number;
    totalPages: number;
  }> {
    const allRecruitments = await this.recruitmentService.getAll(page, limit);
    return allRecruitments;
  }

  // 선택 조건에 맞는 채용 공고 불러오기
  @ApiOperation({
    summary: '조건에 맞는 채용 공고 불러오기',
    description: 'body 조건 Schema 클릭해서 각 필드별로 확인',
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
  @ResponseMsg('Recruitments with selected conditions returned successfully')
  @Post('selected')
  async searchSelected(
    @Body() selectedOptionsDto: SelectedOptionsDto,
    @Query('page') page: number = 1, // 기본값 1
    @Query('limit') limit: number = 20, // 기본값 20
  ): Promise<{
    recruitmentsList: RecruitmentResponseDto[];
    page: number;
    totalRecruitments: number;
    totalPages: number;
  }> {
    const searchedRecruitments = await this.recruitmentService.searchSelected(
      selectedOptionsDto,
      page,
      limit,
    );
    return searchedRecruitments;
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
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 등록 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Recruitment register availability confirmed successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('canRegister')
  async canRegister(@GetUser() center: CenterEntity): Promise<boolean> {
    return await this.recruitmentService.canRegister(center);
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
  async registerImages(
    @GetUser() center: CenterEntity,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string[]> {
    return await this.recruitmentService.uploadImages(center.centerName, files);
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
  @Post('register')
  async register(
    @GetUser() center: CenterEntity,
    @Body() registerRequestDto: RecruitmentRegisterRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const registeredRecruitment = await this.recruitmentService.register(
      center,
      registerRequestDto,
    );
    return registeredRecruitment;
  }

  // 내 공고 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '공고 불러오기',
    description: 'hiring: 채용 중 공고  \nexpired: 만료된 공고',
  })
  @GenericApiResponse({
    status: 200,
    description: '내 공고 불러오기 성공',
    message: 'Recruitment returned successfully',
    model: GetMyRecruitmentsResponseDto,
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
  @ResponseMsg('Recruitment returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Get('getMyRecruitment')
  async getMyRecruitment(
    @GetUser() center: CenterEntity,
  ): Promise<GetMyRecruitmentsResponseDto> {
    const myRecruitment =
      await this.recruitmentService.getMyRecruitment(center);
    const myExpiredRecruitments =
      await this.recruitmentService.getMyExpiredRecruitments(center);
    return new GetMyRecruitmentsResponseDto(
      myRecruitment,
      myExpiredRecruitments,
    );
  }

  // 내 채용 중 공고 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 공고 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '내 공고 수정하기 성공',
    message: 'Hiring recruitment modified successfully',
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
  @ResponseMsg('Hiring recruitment modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('modify')
  async modifyMyRecruitment(
    @GetUser() center: CenterEntity,
    @Body() registerRequestDto: RecruitmentRegisterRequestDto,
  ): Promise<RecruitmentResponseDto> {
    const modifiedRecruitment = await this.recruitmentService.modifyRecruitment(
      center,
      registerRequestDto,
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

  // 채용 중 공고 삭제하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '채용 중 공고 삭제하기',
  })
  @NullApiResponse({
    status: 200,
    description: '공고 삭제 성공',
    message: 'Hiring recruitment deleted successfully',
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
    description: '채용 중 공고가 없음',
    message: 'There is no hiring recruitment',
    error: 'NotFoundException',
  })
  @ResponseMsg('Hiring recruitment deleted successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Get('deleteHiring')
  async deleteHiring(@GetUser() center: CenterEntity): Promise<void> {
    await this.recruitmentService.deleteHiring(center);
  }

  // 내 만료된 중 공고 삭제하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 만료된 중 공고 삭제하기',
  })
  @NullApiResponse({
    status: 200,
    description: '공고 삭제 성공',
    message: 'Selected expired recruitment deleted successfully',
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
    description: '해당 공고를 찾을 수 없음',
    message: 'There is no expired recruitment for selected id',
    error: 'NotFoundException',
  })
  @ResponseMsg('Selected expired recruitment deleted successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('deleteExpired')
  async deleteExpired(@Body() idRequestDto: IdRequestDto): Promise<void> {
    await this.recruitmentService.deleteExpired(idRequestDto.id);
  }
}
