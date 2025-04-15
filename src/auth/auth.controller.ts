import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminSignUpRequestDto } from './dto/user-sign-up-request-dto';
import { UserEntity } from './entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user-decorator';
import { UserResponseDto } from './dto/user-response-dto';
import { CenterSignUpRequestDto } from './dto/center-sign-up-request-dto';
import { CenterResponseDto } from './dto/center-response-dto';
import { CenterEntity } from './entity/center.entity';
import { CenterSignInRequestDto } from './dto/center-sign-in-request-dto';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseTransformInterceptor } from 'src/interceptors/response-transform-interceptor';
import { ResponseMsg } from 'src/decorators/response-message-decorator';
import { ResponseDto } from 'src/response-dto';
import { GenericApiResponse } from 'src/decorators/generic-api-response-decorator';
import { addressResponseDto } from './dto/address-response-dto';
import { TokenResponseDto } from './dto/token-response-dto';
import { PrimitiveApiResponse } from 'src/decorators/primitive-api-response-decorator';
import { RefreshTokenRequestDto } from './dto/refreshToken-request-dto';
import { SignIdRequestDto } from './dto/signId-request-dto';
import { AddressRequestDto } from './dto/address-request-dto';
import { NullApiResponse } from 'src/decorators/null-api-response-decorator';
import { BusinessIdRequestDto } from './dto/businessId-request-dto';
import { BusinessIdIsValidResponseDto } from './dto/businessId-isvalid-response-dto';
import { ErrorApiResponse } from 'src/decorators/error-api-response-decorator';
import { CustomUnauthorizedExceptionFilter } from './custom-unauthorizedExcetption-filter';
import { RolesGuard } from './custom-role.guard';
import { Roles } from 'src/decorators/roles-decorator';
import { EmailCodeConfirmRequestDto } from './dto/email-code-confirm-request-dto';
import { EmailRequestDto } from './dto/email-request-dto';
import { PasswordRequestDto } from './dto/password-request-dto';
import { CenterModifyRequestDto } from './dto/center-modify-request-dto';
import { FindCenterSignIdRequestDto } from './dto/find-center-signId-request-dto';
import { PasswordEmailCodeConfirmRequestDto } from './dto/password-email-code-confirm-request-dto';
import { UserTokenResponseDto } from './dto/user-token-response-dto';
import { CenterTokenResponseDto } from './dto/center-token-response-dto';
import { ResumeResponseDto } from './dto/resume-response-dto';
import { ResumeRegisterRequestDto } from './dto/resume-register-request-dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { PersonalModifyRequestDto } from './dto/personal-modify-request-dto';
import { WorkConditionModifyRequestDto } from './dto/work-condition-modify-request-dto';
import { CareerModifyRequestDto } from './dto/career-modify-request-dto';
import { AdditionalModifyRequestDto } from './dto/additional-modify-request-dto';
import { IntroductionModifyRequestDto } from './dto/introduction-modify-request-dto';
import { AcademyModifyRequestDto } from './dto/academy-modify-request-dto';
import { QualificationModifyRequestDto } from './dto/qualification-modify-request-dto';
import { AwardModifyRequestDto } from './dto/award-modify-request-dto';

@ApiTags('Authorization')
@UseInterceptors(ResponseTransformInterceptor)
@ApiExtraModels(ResponseDto)
@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly jwtService: JwtService, // JwtService 주입
  ) {}

  //문자 출력
  @ApiOperation({
    summary: 'Welcome Authorization 출력',
  })
  @PrimitiveApiResponse({
    status: 200,
    description: '문자 출력 성공',
    message: 'String printed successfully',
    type: 'string',
    example: 'Welcome Authorization',
  })
  @ResponseMsg('String printed successfully')
  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  // signId 중복 체크
  @ApiOperation({
    summary: '아이디 중복 검사',
    description: `
    true: 사용 가능한 아이디  \n
    false: 사용 불가능한 아이디`,
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '아이디 중복 검사 완료',
    message: 'signId duplicate checked successfully',
    type: 'boolean',
    example: true,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'signId must contain only alphanumeric characters(lower case)',
    error: 'BadRequestException',
  })
  @ResponseMsg('signId duplicate checked successfully')
  @Post('/signup/checkId')
  async checkSignIdExists(
    @Body() signIdRequestDto: SignIdRequestDto,
  ): Promise<boolean> {
    try {
      // signId 중복 확인
      await this.authService.checkSignIdExists(signIdRequestDto.signId);
      return true;
    } catch (error) {
      if (error instanceof ConflictException) {
        return false;
      }
      // this.logger.error(`Error checking signId: ${error.message}`);
      throw error; // 다른 예외는 그대로 throw
    }
  }

  // 이메일 중복 검사
  @ApiOperation({
    summary: '이메일 중복 검사',
    description: `
    true: 사용 가능한 이메일  \n
    false: 사용 불가능한 이메일`,
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '이메일 중복 검사 완료',
    message: 'email duplicate checked successfully',
    type: 'boolean',
    example: true,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'email must be an email',
    error: 'BadRequestException',
  })
  @ResponseMsg('email duplicate checked successfully')
  @Post('/signup/checkEmail')
  async checkEmailExists(
    @Body() emailRequestDto: EmailRequestDto,
  ): Promise<boolean> {
    try {
      await this.authService.checkEmailExists(emailRequestDto.email);
      return true;
    } catch (error) {
      if (error instanceof ConflictException) {
        return false;
      }
      throw error; // 다른 예외는 그대로 throw
    }
  }

  // 이메일 인증코드 전송
  @ApiOperation({
    summary: '이메일 인증코드 전송',
  })
  @NullApiResponse({
    status: 201,
    description: '이메일 인증코드 전송 성공',
    message: 'Verification code was sent to your email successfully',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'email must be an email',
    error: 'BadRequestException',
  })
  @ResponseMsg('Verification code was sent to your email successfully')
  @Post('/sendCode')
  async sendCode(@Body() emailRequestDto: EmailRequestDto): Promise<void> {
    return await this.authService.sendVerificationCode(emailRequestDto.email);
  }

  // 이메일 인증코드 확인
  @ApiOperation({
    summary: '이메일 인증코드 확인',
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '이메일 인증코드 유효성 검사 성공',
    message: 'Verification code validated successfully',
    type: 'boolean',
    example: true,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'code must be a string',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 410,
    description: '인증 코드가 유효 시간(3분)이 만료됨',
    message: 'Verification code has expired',
    error: 'GoneException',
  })
  @ResponseMsg('Verification code validated successfully')
  @Post('/confirmCode')
  async confirmCode(
    @Body() emailCodeConfirmRequestDto: EmailCodeConfirmRequestDto,
  ): Promise<boolean> {
    return await this.authService.confirmVerificationCode(
      emailCodeConfirmRequestDto.email,
      emailCodeConfirmRequestDto.code,
    );
  }

  // 관리자 회원 가입 기능
  @ApiOperation({
    summary: '회원가입 (관리자)',
  })
  @GenericApiResponse({
    status: 201,
    description: '관리자 회원가입 성공',
    message: 'Administer signed up successfully',
    model: UserResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'email must be an email',
    error: 'BadRequestException',
  })
  @ResponseMsg('Administer signed up successfully')
  @Post('/signup/admin')
  async adminSignUp(
    @Body() userSignUpRequestDto: AdminSignUpRequestDto,
  ): Promise<UserResponseDto> {
    const admin = await this.authService.adminSignUp(userSignUpRequestDto);
    const userResponseDto = new UserResponseDto(admin);
    return userResponseDto;
  }

  // 주소 검색
  @ApiOperation({
    summary: '주소 검색',
    description: 'query에 주소 검색 시 상세 주소값 후보 반환',
  })
  @GenericApiResponse({
    status: 200,
    description: '주소 검색 완료',
    message: 'Detailed address value returned successfully',
    model: addressResponseDto,
    isArray: true,
  })
  @ErrorApiResponse({
    status: 401,
    description:
      '잘못된 KAKAO_CLIENT_ID, 카카오 개발자 페이지 REST API 키 확인',
    message: 'KAKAO_CLIENT_ID is invalid',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '앱 설정에서 카카오맵이 활성화되지 않음',
    message: 'App disabled OPEN_MAP_AND_LOCAL service',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 500,
    description:
      '주소 검색 API 호출 오류  \n kakao api 서버 상태에 따라 message가 달라짐',
    message: 'API 요청 실패',
    error: 'AxiosError',
  })
  @ResponseMsg('Detailed address value returned successfully')
  @Get('/signup/address')
  async searchAddress(
    @Query() addressRequestDto: AddressRequestDto,
  ): Promise<addressResponseDto> {
    return await this.authService.searchAddress(addressRequestDto.address);
  }

  // 사업자 등록 번호 중복 및 유효성 검사
  @ApiOperation({
    summary: '사업자 등록 번호 중복 및 유효성 검사',
    description: `
    중복 시 ConflictException(409)  \n
    유효성 여부: isValid  \n
    true: 유효한 사업자 등록 번호 \n
    false: 유효하지 않은 사업자 등록 번호`,
  })
  @GenericApiResponse({
    status: 201,
    description: '사업자 등록 번호 중복 및 유효성 검사 완료',
    message: 'businessId validated successfully',
    model: BusinessIdIsValidResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'businessId format must be 000-00-00000',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '중복된 businessId',
    message: 'businessId already exists',
    error: 'ConflictException',
  })
  @ErrorApiResponse({
    status: 500,
    description:
      '사업자 등록 번호 유효성 검사 API 호출 오류  \n 공공데이터포탈 서버 상태에 따라 statusCode, message가 달라질 수 있음',
    message: 'API 요청 실패',
    error: 'InternalServerError',
  })
  @ResponseMsg('businessId validated successfully')
  @Post('/signup/checkBusinessId')
  async checkBusinessIsValid(
    @Body() businessIdRequestDto: BusinessIdRequestDto,
  ) {
    await this.authService.checkBusinessIdExists(
      businessIdRequestDto.businessId,
    );
    return await this.authService.checkBusinessIdValid(
      businessIdRequestDto.businessId,
    );
  }

  // 센터 회원 가입 기능
  @ApiOperation({
    summary: '회원가입 (센터)',
  })
  @GenericApiResponse({
    status: 201,
    description: '센터 회원가입 성공',
    message: 'Center signed up successfully',
    model: CenterResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'signId must contain only alphanumeric characters(lower case)',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 409,
    description: 'signId, 이메일, 사업자등록번호 중 이미 존재하는 필드가 있음',
    message: 'signId already exists',
    error: 'ConflictException',
  })
  @ResponseMsg('Center signed up successfully')
  @Post('/signup/center')
  async centerSignUp(
    @Body() centerSignUpRequestDto: CenterSignUpRequestDto,
  ): Promise<CenterResponseDto> {
    const center = await this.authService.centerSignUp(centerSignUpRequestDto);
    const centerResponseDto = new CenterResponseDto(center);
    return centerResponseDto;
  }

  // 센터 아이디 찾기
  @ApiOperation({
    summary: '센터 아이디 찾기',
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '센터 아이디 찾기 성공',
    message: 'Your signId was found successfully',
    type: 'string',
    example: 'sampleid',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'businessId format must be 000-00-00000',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '입력된 ceoName과 businessId에 해당하는 계정을 찾을 수 없음',
    message: 'There is no center entity with requested ceoName and businessId',
    error: 'NotFoundException',
  })
  @ResponseMsg('Your signId was found successfully')
  @Post('findCenterSignId')
  async findCenterSignId(
    @Body() findSignIdRequestDto: FindCenterSignIdRequestDto,
  ): Promise<string> {
    const signId = await this.authService.findCenterSignId(
      findSignIdRequestDto.ceoName,
      findSignIdRequestDto.businessId,
    );
    return signId;
  }

  // 센터 비밀번호 찾기 이메일 인증코드 전송
  @ApiOperation({
    summary: '센터 비밀번호 찾기 - 이메일 인증코드 전송',
  })
  @NullApiResponse({
    status: 201,
    description: '이메일 인증코드 전송 성공',
    message: 'Verification code was sent to your email successfully',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'signId must be a string',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '입력된 signId에 해당하는 계정을 찾을 수 없음',
    message: 'There is no center entity with requested signId',
    error: 'NotFoundException',
  })
  @ResponseMsg('Verification code was sent to your email successfully')
  @Post('findCenterPassword')
  async findCenterPassword(
    @Body() signIdRequestDto: SignIdRequestDto,
  ): Promise<string> {
    return await this.authService.findCenterPassword(signIdRequestDto.signId);
  }

  // 센터 비밀번호 찾기 - 새로운 비밀번호 설정
  @ApiOperation({
    summary: '센터 비밀번호 찾기 - 새 비밀번호 설정',
  })
  @NullApiResponse({
    status: 201,
    description: '새 비밀번호 설정 성공',
    message: 'New password set successfully',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'password must contain English, numbers, and special characters',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '입력된 signId에 해당하는 계정을 찾을 수 없음',
    message: 'There is no center entity with requested signId',
    error: 'NotFoundException',
  })
  @ResponseMsg('New password set successfully')
  @Post('/newCenterPassword')
  async newCenterPassword(
    @Body()
    passwordEmailCodeConfirmRequestDto: PasswordEmailCodeConfirmRequestDto,
  ): Promise<void> {
    return await this.authService.newCenterPassword(
      passwordEmailCodeConfirmRequestDto.signId,
      passwordEmailCodeConfirmRequestDto.newPassword,
    );
  }

  // 회원정보 수정을 위한 비밀번호 확인
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '회원정보 수정을 위한 비밀번호 확인',
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '비밀번호 확인 성공',
    message: 'Your password validated successfully',
    type: 'boolean',
    example: true,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'password must be a string',
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
    description: '센터 회원이 아님 (센터 회원만 정보 수정 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Your password validated successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('isPasswordValid')
  async isPasswordValid(
    @GetUser() center: CenterEntity,
    @Body() PasswordRequestDto: PasswordRequestDto,
  ): Promise<boolean> {
    return await this.authService.isPasswordValid(
      center,
      PasswordRequestDto.password,
    );
  }

  // 센터 회원 정보 수정
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '센터 회원 정보 수정',
  })
  @GenericApiResponse({
    status: 201,
    description: '회원 정보 수정 성공',
    message: 'Your information modified successfully',
    model: CenterResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'password must contain English, numbers, and special characters',
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
    description: '센터 회원이 아님 (센터 회원만 정보 수정 가능)',
    message: 'Not a member of the CENTER (only CENTER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '해당 이메일의 센터 회원이 이미 존재함',
    message: 'email already exists',
    error: 'ConflictException',
  })
  @ResponseMsg('Your information modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('CENTER')
  @Post('modifyCenter')
  async modifyCenter(
    @GetUser() center: CenterEntity,
    @Body() centerModifyRequestDto: CenterModifyRequestDto,
  ): Promise<CenterResponseDto> {
    const modifiedCenter = await this.authService.modifyCenter(
      center,
      centerModifyRequestDto,
    );
    const centerResponseDto = new CenterResponseDto(modifiedCenter);
    return centerResponseDto;
  }

  // 관리자 로그인 엔드포인트
  @ApiOperation({
    summary: '관리자 로그인',
  })
  @GenericApiResponse({
    status: 201,
    description: '로그인 성공',
    message: 'Admin signed in successfully',
    model: UserTokenResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'adminId should not be empty',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '잘못된 adminId 혹은 email',
    message: 'Incorrect adminId or email',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('Admin signed in successfully')
  @Post('/adminSignin')
  async adminSignIn(
    @Body() adminSignInRequestDto: AdminSignUpRequestDto,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    // [1] 로그인 처리
    const { accessToken, refreshToken, admin } =
      await this.authService.adminSignIn(adminSignInRequestDto);

    const userResponseDto = new UserResponseDto(admin);

    // [2] 응답 반환 JSON으로 토큰 전송
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: userResponseDto,
    };
  }

  // 센터 로그인 엔드포인트
  @ApiOperation({
    summary: '센터 로그인',
  })
  @GenericApiResponse({
    status: 201,
    description: '로그인 성공',
    message: 'Center signed in successfully',
    model: CenterTokenResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'password should not be empty',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '잘못된 signId 혹은 password',
    message: 'Incorrect signId or password',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('Center signed in successfully')
  @Post('/centerSignin')
  async centerSignIn(
    @Body() centerSignInRequestDto: CenterSignInRequestDto,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    center: CenterResponseDto;
  }> {
    // [1] 로그인 처리
    const { accessToken, refreshToken, center } =
      await this.authService.centerSignIn(centerSignInRequestDto);

    const centerResponseDto = new CenterResponseDto(center);

    // [2] 응답 반환 JSON으로 토큰 전송
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      center: centerResponseDto,
    };
  }

  // 카카오 로그인/회원가입 페이지 요청
  @ApiOperation({
    summary: '카카오 로그인/회원가입 페이지',
    description: `카카오 로그인/회원가입 페이지로 redirect  \n
    Swagger에서 redirect 테스트 불가. 외부에서 해당 엔드포인트 호출`,
  })
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin() {
    // 이 부분은 Passport의 AuthGuard에 의해 카카오 로그인 페이지로 리다이렉트
  }

  // 카카오 로그인 콜백 엔드포인트
  @ApiOperation({
    summary: '카카오 로그인 콜백',
    description: '카카오 로그인 콜백 및 accessToken, refreshToken 생성',
  })
  @GenericApiResponse({
    status: 201,
    description: '카카오 로그인에 성공',
    message: 'Signed in successfully with KaKao Account',
    model: UserTokenResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않은 인가코드 입력(재사용 포함)',
    message: 'Authorization code is invalid',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('Signed in successfully with KaKao Account')
  @Post('/kakao/callback')
  async kakaoCallback(@Query('code') kakaoAuthResCode: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    const { accessToken, refreshToken, user } =
      await this.authService.signInWithKakao(kakaoAuthResCode);

    const userResponseDto = new UserResponseDto(user);
    return {
      accessToken: accessToken, // 헤더로 사용할 Access Token
      refreshToken: refreshToken, // 클라이언트 보안 저장소에 저장할 Refresh Token
      user: userResponseDto,
    };
  }

  // 회원 탈퇴
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '회원 탈퇴 및 refreshToken 삭제',
  })
  @NullApiResponse({
    status: 201,
    description: '회원 탈퇴 성공',
    message: 'Account deleted successfully',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('Account deleted successfully')
  @Post('/delete')
  @UseGuards(AuthGuard()) // JWT 인증이 필요한 엔드포인트
  @UseFilters(CustomUnauthorizedExceptionFilter)
  async deleteUser(@GetUser() member: UserEntity | CenterEntity) {
    await this.authService.deleteUser(member);
  }

  // 토큰 재발급
  @ApiOperation({
    summary: '토큰 재발급',
    description: 'accessToken 기간 만료 시 accessToken 및 refreshToken 재발급',
  })
  @GenericApiResponse({
    status: 201,
    description: '토큰 재발급 성공',
    message: 'Token refreshed successfully',
    model: TokenResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 refreshToken',
    message: 'Invalid or expired refreshToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'refreshToken must be a jwt string',
    error: 'BadRequestException',
  })
  @ResponseMsg('Token refreshed successfully')
  @Post('/refresh')
  async refresh(
    @Body() refreshTokenRequestDto: RefreshTokenRequestDto,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    member: UserResponseDto | CenterResponseDto;
  }> {
    // refresh token 에서 signId 추출
    const decodedToken = (await this.jwtService.decode(
      refreshTokenRequestDto.refreshToken,
    )) as any;
    const email = decodedToken?.email;
    if (!email) {
      throw new UnauthorizedException('Invalid or expired refreshToken');
    }
    const {
      accessToken,
      refreshToken: newRefreshToken,
      member,
    } = await this.authService.refreshAccessToken(
      refreshTokenRequestDto.refreshToken,
    );
    const responseDto =
      member instanceof UserEntity
        ? new UserResponseDto(member)
        : new CenterResponseDto(member);
    return {
      accessToken: accessToken,
      refreshToken: newRefreshToken,
      member: responseDto,
    };
  }

  // 애플 로그인/회원가입 페이지 요청
  @ApiOperation({
    summary: '애플 로그인/회원가입 페이지',
    description: `애플 로그인/회원가입 페이지로 redirect  \n
    Swagger에서 redirect 테스트 불가. 외부에서 해당 엔드포인트 호출`,
  })
  @Get('/apple')
  @UseGuards(AuthGuard('apple'))
  async appleLogin() {
    // 이 부분은 Passport의 AuthGuard에 의해 애플 로그인 페이지로 리다이렉트
  }

  // 애플 로그인 콜백 엔드포인트
  @ApiOperation({
    summary: '애플 로그인 콜백',
    description: '애플 로그인 콜백 및 accessToken, refreshToken 생성',
  })
  @GenericApiResponse({
    status: 201,
    description: '애플 로그인에 성공',
    message: 'Signed in successfully with Apple Account',
    model: UserTokenResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않은 Apple ID_Token',
    message: 'ID Token is invalid',
    error: 'UnauthorizedException',
  })
  @ResponseMsg('Signed in successfully with Apple Account')
  @Post('/apple/callback')
  async appleCallback(@Body() payload): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    const { accessToken, refreshToken, user } =
      await this.authService.signInWithApple(payload);

    const userResponseDto = new UserResponseDto(user);
    return {
      accessToken: accessToken, // 헤더로 사용할 Access Token
      refreshToken: refreshToken, // 클라이언트 보안 저장소에 저장할 Refresh Token
      user: userResponseDto,
    };
  }

  // 증명사진 업로드
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '증명사진 등록하기',
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '증명사진 등록 성공',
    message: 'Profile image uploaded successfully',
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
    description: '유저 회원이 아님 (유저 회원만 포트폴리오 이미지 등록 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '이미지 업로드',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '이미지 파일',
        },
      },
    },
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @UseInterceptors(FileInterceptor('image'))
  @ResponseMsg('Profile image uploaded successfully')
  @Post('uploadProfileImage')
  async uploadProfileImage(
    @GetUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.authService.uploadProfileImage(user, file);
  }

  // 포트폴리오 파일 업로드
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '포트폴리오 파일 등록하기',
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '포트폴리오 파일 등록 성공',
    message: 'Portfolio file uploaded successfully',
    type: 'string',
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
    description: '유저 회원이 아님 (유저 회원만 포트폴리오 파일 등록 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 파일 (PDF, DOCX 등)',
        },
      },
    },
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMsg('Portfolio file uploaded successfully')
  @Post('uploadPortfolioFile')
  async uploadPortfolioFile(
    @GetUser() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.authService.uploadPortfolioFile(user, file);
  }

  // 포트폴리오 다중 이미지 등록
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '포트폴리오 이미지 등록하기',
  })
  @PrimitiveApiResponse({
    status: 201,
    description: '포트폴리오 이미지 등록 성공',
    message: 'Portfolio images uploaded successfully',
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
    description: '유저 회원이 아님 (유저 회원만 포트폴리오 이미지 등록 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '이미지 파일 업로드',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' }, // 여러 개의 파일 처리
          description: '이미지 파일 등록(최대 10개)',
        },
      },
    },
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ResponseMsg('Portfolio images uploaded successfully')
  @Post('uploadPortfolioImages')
  async uploadPortfolioImages(
    @GetUser() user: UserEntity,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string[]> {
    return await this.authService.uploadPortfolioImages(user, files);
  }

  // 이력서 보유 여부 확인
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '이력서 보유 여부 확인',
    description: `
    true: 이력서 보유  \n
    false: 이력서 미보유`,
  })
  @PrimitiveApiResponse({
    status: 200,
    description: '이력서 보유 여부 확인',
    message: 'Resume retention checked successfully',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 보유 여부 확인 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Resume retention checked successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Get('/hasResume')
  async hasResume(@GetUser() user: UserEntity): Promise<boolean> {
    return await this.authService.hasResume(user);
  }

  // 이력서 등록
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '이력서 등록',
  })
  @GenericApiResponse({
    status: 201,
    description: '이력서 등록 성공',
    message: 'Resume registered successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'phone format must be 000-0000-0000',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 등록 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '이미 등록된 이력서가 있음',
    message: 'Your resume already exists',
    error: 'ConflictException',
  })
  @ResponseMsg('Resume registered successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('registerResume')
  async registerResume(
    @GetUser() user: UserEntity,
    @Body() resumeRegisterRequestDto: ResumeRegisterRequestDto,
  ): Promise<ResumeResponseDto> {
    console.log('📌 registerResume() called');
    return await this.authService.registerResume(
      user,
      resumeRegisterRequestDto,
    );
  }

  // 내 이력서 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 이력서 불러오기',
  })
  @GenericApiResponse({
    status: 200,
    description: '내 이력서 불러오기 성공',
    message: 'My resume returned successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '유저 회원이 아님 (유저 회원만 이력서 등록 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('My resume returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Get('getMyResume')
  async getMyResume(@GetUser() user: UserEntity): Promise<ResumeResponseDto> {
    return await this.authService.getMyResume(user);
  }

  // 이력서 삭제하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '이력서 삭제하기',
  })
  @NullApiResponse({
    status: 200,
    description: '이력서 삭제 성공',
    message: 'Resume deleted successfully',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '유저 회원이 아님 (유저 회원만 이력서 삭제 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Resume deleted successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Get('deleteResume')
  async deleteResume(@GetUser() user: UserEntity): Promise<void> {
    await this.authService.deleteResume(user);
  }

  // 이력서 개인정보 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '개인정보 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '개인정보 수정하기 성공',
    message: 'Personal information modified successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'phone format must be 000-0000-0000',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 수정 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Personal information modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('modifyPersonal')
  async modifyPersonal(
    @GetUser() user: UserEntity,
    @Body() personalModifyRequestDto: PersonalModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    return await this.authService.modifyPersonal(
      user,
      personalModifyRequestDto,
    );
  }

  // 이력서 희망근무조건 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '희망근무조건 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '희망근무조건 수정하기 성공',
    message: 'Work condition modified successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'location should not be empty',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 수정 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Work condition modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('modifyWorkCondition')
  async modifyWorkCondition(
    @GetUser() user: UserEntity,
    @Body() workConditionModifyRequestDto: WorkConditionModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    return await this.authService.modifyWorkCondition(
      user,
      workConditionModifyRequestDto,
    );
  }

  // 이력서 경력정보 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '경력정보 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '경력정보 수정하기 성공',
    message: 'Career modified successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'isNew should not be empty',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 수정 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Career modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('modifyCareer')
  async modifyCareer(
    @GetUser() user: UserEntity,
    @Body() careerModifyRequestDto: CareerModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    return await this.authService.modifyCareer(user, careerModifyRequestDto);
  }

  // 이력서 학력정보 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '학력정보 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '학력정보 수정하기 성공',
    message: 'Academy modified successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'isNew should not be empty',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 수정 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Academy modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('modifyAcademy')
  async modifyAcademy(
    @GetUser() user: UserEntity,
    @Body() academyModifyRequestDto: AcademyModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    return await this.authService.modifyAcademy(user, academyModifyRequestDto);
  }

  // 이력서 자격증정보 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '자격증정보 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '자격증정보 수정하기 성공',
    message: 'Qualification modified successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'isNew should not be empty',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 수정 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Qualification modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('modifyQualification')
  async modifyQualification(
    @GetUser() user: UserEntity,
    @Body() qualificationModifyRequestDto: QualificationModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    return await this.authService.modifyQualification(
      user,
      qualificationModifyRequestDto,
    );
  }

  // 이력서 수상정보 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '수상정보 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '수상정보 수정하기 성공',
    message: 'Award modified successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'isNew should not be empty',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 수정 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Award modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('modifyAward')
  async modifyAward(
    @GetUser() user: UserEntity,
    @Body() awardModifyRequestDto: AwardModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    return await this.authService.modifyAward(user, awardModifyRequestDto);
  }

  // 이력서 추가정보 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '추가정보 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '추가정보 수정하기 성공',
    message: 'Additional information modified successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'SNS must be a string',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 수정 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Additional information modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('modifyAdditional')
  async modifyAdditional(
    @GetUser() user: UserEntity,
    @Body() additionalModifyRequestDto: AdditionalModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    return await this.authService.modifyAdditional(
      user,
      additionalModifyRequestDto,
    );
  }

  // 이력서 자기소개 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '자기소개 수정하기',
  })
  @GenericApiResponse({
    status: 201,
    description: '자기소개 수정하기 성공',
    message: 'Introduction modified successfully',
    model: ResumeResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'introduction must be a string',
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
    description: '유저 회원이 아님 (유저 회원만 이력서 수정 가능)',
    message: 'Not a member of the USER (only USER can call this api)',
    error: 'ForbiddenException',
  })
  @ErrorApiResponse({
    status: 404,
    description: '등록한 이력서가 없음',
    message: 'There is no registered resume',
    error: 'NotFoundException',
  })
  @ResponseMsg('Introduction modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('USER')
  @Post('modifyIntroduction')
  async modifyIntroduction(
    @GetUser() user: UserEntity,
    @Body() introductionModifyRequestDto: IntroductionModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    return await this.authService.modifyIntroduction(
      user,
      introductionModifyRequestDto,
    );
  }
}
