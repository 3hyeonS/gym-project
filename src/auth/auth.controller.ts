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

      this.logger.error(`Error checking signId: ${error.message}`);
      throw error; // 다른 예외는 그대로 throw
    }
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
  @ResponseMsg('User signed up successfully')
  @Post('/signup/user')
  async userSignUp(
    @Body() userSignUpRequestDto: UserSignUpRequestDto,
  ): Promise<UserResponseDto> {
    this.logger.verbose(
      `Attempting to sign up user with signId: ${userSignUpRequestDto.signId}`,
    );
    const user = await this.authService.userSignUp(userSignUpRequestDto);
    const userResponseDto = new UserResponseDto(user);
    this.logger.verbose(
      `User signed up successfully: ${JSON.stringify(userResponseDto)}`,
    );
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
  @ResponseMsg('Detailed address value returned successfully')
  @Get('/signup/address')
  async searchAddress(@Query() addressRequestDto: AddressRequestDto) {
    return this.authService.searchAddress(addressRequestDto.address);
  }

  @ApiOperation({
    summary: '사업자 등록 번호 유효성 검사',
    description: `
    유효성 여부: isValid  \n
    true: 유효한 사업자 등록 번호 \n
    false: 유효하지 않은 사업자 등록 번호`,
  })
  @GenericApiResponse({
    status: 201,
    description: '사업자 등록 번호 유효성 검사 완료',
    message: 'businessId validated successfully',
    model: BusinessIdIsValidResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: '"businessId format must be 000-00-00000"',
    error: 'BadRequestException',
  })
  @ResponseMsg('businessId validated successfully')
  @Post('/signup/checkBusinessId')
  async checkBusinessIsValid(
    @Body() businessIdRequestDto: BusinessIdRequestDto,
  ) {
    if (!businessIdRequestDto.businessId) {
      throw new BadRequestException('사업자등록번호를 입력하세요.');
    }

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
  @ResponseMsg('Center signed up successfully')
  @Post('/signup/center')
  async centerSignUp(
    @Body() centerSignUpRequestDto: CenterSignUpRequestDto,
  ): Promise<CenterResponseDto> {
    this.logger.verbose(
      `Attempting to sign up user with signId: ${centerSignUpRequestDto.signId}`,
    );
    const center = await this.authService.centerSignUp(centerSignUpRequestDto);
    const centerResponseDto = new CenterResponseDto(center);
    this.logger.verbose(
      `Center signed up successfully: ${JSON.stringify(centerResponseDto)}`,
    );
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
    this.logger.verbose(
      `Attempting to sign in user with signId: ${signInRequestDto.signId}`,
    );

    // [1] 로그인 처리
    const { accessToken, refreshToken, member } =
      await this.authService.signIn(signInRequestDto);

    const responseDto =
      member instanceof UserEntity
        ? new UserResponseDto(member)
        : new CenterResponseDto(member);

    this.logger.verbose(
      `${member.role} signed in successfully: ${JSON.stringify(responseDto)}`,
    );

    // [2] 응답 반환 JSON으로 토큰 전송
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      member,
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

    this.logger.verbose(
      `User signed in successfully: ${JSON.stringify(userResponseDto)}`,
    );
    return {
      accessToken: accessToken, // 헤더로 사용할 Access Token
      refreshToken: refreshToken, // 클라이언트 보안 저장소에 저장할 Refresh Token
      member: userResponseDto,
    };
  }

  // 로그아웃
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '로그아웃',
    description: '로그아웃 및 refreshToken 삭제',
  })
  @NullApiResponse({
    status: 201,
    description: '로그아웃 성공',
    message: 'Signed out successfully',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken 혹은 refreshToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message: 'refreshToken must be a jwt string',
    error: 'BadRequestException',
  })
  @ResponseMsg('Signed out successfully')
  @UseFilters(CustomUnauthorizedExceptionFilter)
  @Post('/signout')
  @UseGuards(AuthGuard())
  async logout(@Body() refreshTokenRequestDto: RefreshTokenRequestDto) {
    await this.authService.revokeRefreshToken(
      refreshTokenRequestDto.refreshToken,
    );
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
    this.logger.verbose(
      `Attempting to delete user with signId: ${member.signId}`,
    );
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
    message: '"refreshToken must be a jwt string"',
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

// // 인증된 회원이 들어갈 수 있는 테스트 URL 경로
// @ApiOperation({
//   summary: '인증 회원 경로 테스트',
//   description: '인증된 회원만 접근 가능',
// })
// @ResponseMsg('인증됨')
// @ApiResponse({
//   status: 200,
//   description: '로그인에 성공했습니다.',
//   model: UserResponseDto|CenterResponseDto,
// })
// @Post('/signed')
// @UseGuards(AuthGuard()) // @UseGuards : 핸들러는 지정한 인증 가드가 적용됨 -> AuthGuard()의 'jwt'는 기본값으로 생략가능
// async testForAuth(
//   @GetUser() member: UserEntity | CenterEntity,
// ): Promise<UserResponseDto | CenterResponseDto> {
//   let responseDto: UserResponseDto | CenterResponseDto;
//   if (member instanceof UserEntity) {
//     responseDto = new UserResponseDto(member);
//     this.logger.verbose(
//       `Authenticated user accessing test route: ${member.signId}`,
//     );
//   } else {
//     responseDto = new CenterResponseDto(member);
//     this.logger.verbose(
//       `Authenticated center accessing test route: ${member.signId}`,
//     );
//   }
//   return responseDto;
// }
