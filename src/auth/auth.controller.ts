import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpRequestDto } from './dto/user-sign-up-request.dto';
import { UserEntity } from './entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user-decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { CenterSignUpRequestDto } from './dto/center-sign-up-request.dto';
import { CenterResponseDto } from './dto/center-response.dto';
import { CenterEntity } from './entity/center.entity';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { JwtService } from '@nestjs/jwt';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseTransformInterceptor } from 'src/interceptors/response-transform-interceptor';
import { ResponseMsg } from 'src/decorators/response-message-decorator';
import { ResponseDto } from 'src/response-dto';
import { GenericApiResponse } from 'src/decorators/generic-api-response-decorator';
import { addressResponseDto } from './dto/address-response.dto';
import { tokenResponseDto } from './dto/token-response-dto';
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
import { MemberRole } from './entity/member.entity';
import { EmailCodeConfirmRequestDto } from './dto/email-code-confirm-request.dto';
import { EmailRequestDto } from './dto/email-request.dto';
import { PasswordRequestDto } from './dto/password-request-dto';
import { CenterModifyRequestDto } from './dto/center-modify-request.dto';
import { FindCenterSignIdRequestDto } from './dto/find-center-signId-request-dto';
import { PasswordEmailCodeConfirmRequestDto } from './dto/password-email-code-confirm-request.dto';

@ApiTags('Authorization')
@UseInterceptors(ResponseTransformInterceptor)
@ApiExtraModels(ResponseDto)
@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성

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
  @ResponseMsg('signId duplicate checked successfully')
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
    summary: '회원가입 이메일 인증코드 전송',
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

  // 일반 회원 가입 기능
  @ApiOperation({
    summary: '회원가입 (일반 유저, 관리자)',
    description: `
    role은 관리자일 경우만 ADMIN으로 입력  \n
    (일반 유저는 입력 안해도 무관)`,
  })
  @GenericApiResponse({
    status: 201,
    description: '일반 유저 회원가입 성공',
    message: 'User signed up successfully',
    model: UserResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'signId must contain only alphanumeric characters(lower case)',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '중복된 signId',
    message: 'signId already exists',
    error: 'ConflictException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '중복된 email',
    message: 'email already exists',
    error: 'ConflictException',
  })
  @ResponseMsg('User signed up successfully')
  @Post('/signup/user')
  async userSignUp(
    @Body() userSignUpRequestDto: UserSignUpRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.authService.userSignUp(userSignUpRequestDto);
    const userResponseDto = new UserResponseDto(user);
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
    status: 500,
    description:
      '주소 검색 API 호출 오류  \n kakao api 서버 상태에 따라 statusCode, message가 달라질 수 있음',
    message: 'API 요청 실패',
    error: 'InternalServerError',
  })
  @ResponseMsg('Detailed address value returned successfully')
  @Get('/signup/address')
  async searchAddress(
    @Query() addressRequestDto: AddressRequestDto,
  ): Promise<addressResponseDto> {
    return this.authService.searchAddress(addressRequestDto.address);
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
    return this.authService.checkBusinessIdValid(
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
    description: '중복된 signId',
    message: 'signId already exists',
    error: 'ConflictException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '중복된 email',
    message: 'email already exists',
    error: 'ConflictException',
  })
  @ErrorApiResponse({
    status: 409,
    description: '중복된 businessId',
    message: 'businessId already exists',
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
  @ResponseMsg('Your password validated successfully')
  @UseGuards(AuthGuard())
  @Post('isPasswordValid')
  async isPasswordValid(
    @GetUser() member: UserEntity | CenterEntity,
    @Body() PasswordRequestDto: PasswordRequestDto,
  ): Promise<boolean> {
    return await this.authService.isPasswordValid(
      member,
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
  @ResponseMsg('Your information modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(MemberRole.CENTER)
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

  // 통합 로그인 엔드포인트
  @ApiOperation({
    summary: '통합 로그인',
    description: '유저, 관리자, 센터 통합 로그인',
  })
  @GenericApiResponse({
    status: 201,
    description: '로그인 성공',
    message: 'Signed in successfully',
    model: tokenResponseDto,
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
  @ResponseMsg('Signed in successfully')
  @Post('/signin')
  async signIn(@Body() signInRequestDto: SignInRequestDto): Promise<{
    member: UserResponseDto | CenterResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {
    // [1] 로그인 처리
    const { accessToken, refreshToken, member } =
      await this.authService.signIn(signInRequestDto);

    const responseDto =
      member instanceof UserEntity
        ? new UserResponseDto(member)
        : new CenterResponseDto(member);

    // [2] 응답 반환 JSON으로 토큰 전송
    return {
      member: responseDto,
      accessToken: accessToken,
      refreshToken: refreshToken,
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
    model: tokenResponseDto,
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
    member: UserResponseDto;
  }> {
    // Authorization Code 받기
    const { accessToken, refreshToken, user } =
      await this.authService.signInWithKakao(kakaoAuthResCode);

    const userResponseDto = new UserResponseDto(user);
    return {
      accessToken: accessToken, // 헤더로 사용할 Access Token
      refreshToken: refreshToken, // 클라이언트 보안 저장소에 저장할 Refresh Token
      member: userResponseDto,
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
    await this.authService.deleteUser(member, member.signId);
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
    model: tokenResponseDto,
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
    const decodedToken = this.jwtService.decode(
      refreshTokenRequestDto.refreshToken,
    ) as any;
    const signId = decodedToken?.signId;
    if (!signId) {
      throw new UnauthorizedException('Invalid or expired refreshToken');
    }
    const {
      accessToken,
      refreshToken: newRefreshToken,
      member,
    } = await this.authService.refreshAccessToken(
      signId,
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
}
