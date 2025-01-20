import {
  Body,
  ConflictException,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpRequestDto } from './dto/user-sign-up-request.dto';
import { UserEntity } from './entity/user.entity';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user-decorator';
import { ApiResponse } from './dto/api-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CenterSignUpRequestDto } from './dto/center-sign-up-request.dto';
import { CenterResponseDto } from './dto/center-response.dto';
import { CenterEntity } from './entity/center.entity';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { MemberEntity } from './entity/member.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entity/refreshToken.entity';
import { Repository } from 'typeorm';

@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성

  constructor(
    private authService: AuthService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService, // JwtService 주입
  ) {}

  // 일반 회원 가입 기능
  @Post('/signup/user')
  async userSignUp(
    @Body() userSignUpRequestDto: UserSignUpRequestDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    this.logger.verbose(
      `Attempting to sign up user with signId: ${userSignUpRequestDto.signId}`,
    );
    const user = await this.authService.userSignUp(userSignUpRequestDto);
    const userResponseDto = new UserResponseDto(user);
    this.logger.verbose(
      `User signed up successfully: ${JSON.stringify(userResponseDto)}`,
    );
    return new ApiResponse(
      true,
      201,
      'User signed up successfully',
      userResponseDto,
    );
  }

  // 센터 회원 가입 기능
  @Post('/signup/center')
  async centersignUp(
    @Body() centerSignUpRequestDto: CenterSignUpRequestDto,
  ): Promise<ApiResponse<CenterResponseDto>> {
    this.logger.verbose(
      `Attempting to sign up user with signId: ${centerSignUpRequestDto.signId}`,
    );
    const center = await this.authService.centerSignUp(centerSignUpRequestDto);
    const centerResponseDto = new CenterResponseDto(center);
    this.logger.verbose(
      `User signed up successfully: ${JSON.stringify(centerResponseDto)}`,
    );
    return new ApiResponse(
      true,
      201,
      'User signed up successfully',
      centerResponseDto,
    );
  }

  // signId 중복 체크
  @Post('/signup/checkId')
  async checkSignIdExists(@Body() signId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    this.logger.verbose(`Checking if signId exists: ${signId}`);
    try {
      // signId 중복 확인
      await this.authService.checkSignIdExists(signId);
      this.logger.verbose(`signId is available: ${signId}`);
      return { success: true, message: 'signId is available' };
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.warn(`signId already exists: ${signId}`);
        return { success: false, message: 'signId already exists' };
      }

      this.logger.error(`Error checking signId: ${error.message}`);
      throw error; // 다른 예외는 그대로 throw
    }
  }

  //사업자 등록 번호 유효성 검사
  @Post('/signup/checkBusinessId')
  async checkBusinessIdValid(@Body('businessId') businessId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    this.logger.verbose(`Checking if businessId valid: ${businessId}`);
    // 10자리 숫자인가?
    if (!/^[0-9]{10}$/.test(businessId)) {
      this.logger.warn(`businessId is not valid: ${businessId}`);
      return {
        success: false,
        message: '유효하지 않은 사업자 등록 번호입니다.',
      };
    }

    // 각 자리에 대한 가중치 값
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];

    // 마지막 숫자는 체크디지트
    const checkDigit = parseInt(businessId[9], 10);

    // 가중치를 곱한 합계를 계산
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      const digit = parseInt(businessId[i], 10);
      if (i === 8) {
        // 8번째 자리 가중치 계산 시 추가로 10을 곱한 뒤 10으로 나눈 몫을 더함
        sum += Math.floor((digit * weights[i]) / 10);
      }
      sum += digit * weights[i];
    }

    // 10으로 나눈 나머지를 계산하고, 이를 10에서 뺀 값이 체크디지트와 일치해야 유효함
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    const isvalid = checkDigit === calculatedCheckDigit;

    if (isvalid) {
      this.logger.verbose(`businessId is valid: ${businessId}`);
      return { success: isvalid, message: '유효한 사업자 등록 번호입니다.' };
    } else {
      this.logger.warn(`businessId is not valid: ${businessId}`);
      return {
        success: isvalid,
        message: '유효하지 않은 사업자 등록 번호입니다.',
      };
    }
  }

  // 일반 회원 로그인 기능
  @Post('/signin/user')
  async userSignIn(
    @Body() signInRequestDto: SignInRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.verbose(
      `Attempting to sign in user with signId: ${signInRequestDto.signId}`,
    );
    const { jwtToken, refreshToken, user } =
      await this.authService.userSignIn(signInRequestDto);
    const userResponseDto = new UserResponseDto(user);
    this.logger.verbose(
      `User signed in successfully: ${JSON.stringify(userResponseDto)}`,
    );

    // [3] 쿠키 설정
    res.cookie('Authorization', jwtToken, {
      httpOnly: true, // 클라이언트 측 스크립트에서 쿠키 접근 금지
      secure: false, // HTTPS에서만 쿠키 전송, 임시 비활성화
      maxAge: 3600000, // 1시간
      sameSite: 'none', // CSRF 공격 방어
    });

    res.cookie('RefreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 3600000, // 7일
      sameSite: 'none',
    });

    res.status(200).json(
      new ApiResponse(true, 200, 'Sign in successful', {
        jwtToken,
        user: userResponseDto,
      }),
    );
  }

  // 센터 회원 로그인 기능
  @Post('/signin/center')
  async signIn(
    @Body() signInRequestDto: SignInRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.verbose(
      `Attempting to sign in user with signId: ${signInRequestDto.signId}`,
    );
    const { jwtToken, refreshToken, center } =
      await this.authService.centerSignIn(signInRequestDto);
    const centerResponsetDto = new CenterResponseDto(center);
    this.logger.verbose(
      `User signed in successfully: ${JSON.stringify(centerResponsetDto)}`,
    );

    // [3] 쿠키 설정
    res.cookie('Authorization', jwtToken, {
      httpOnly: true, // 클라이언트 측 스크립트에서 쿠키 접근 금지
      secure: false, // HTTPS에서만 쿠키 전송, 임시 비활성화
      maxAge: 3600000, // 1시간
      sameSite: 'none', // CSRF 공격 방어
    });

    res.cookie('RefreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 3600000, // 7일
      sameSite: 'none',
    });

    res.status(200).json(
      new ApiResponse(true, 200, 'Sign in successful', {
        jwtToken,
        center: centerResponsetDto,
      }),
    );
  }

  // 인증된 회원이 들어갈 수 있는 테스트 URL 경로
  @Post('/signed')
  @UseGuards(AuthGuard()) // @UseGuards : 핸들러는 지정한 인증 가드가 적용됨 -> AuthGuard()의 'jwt'는 기본값으로 생략가능
  async testForAuth(
    @GetUser() member: UserEntity | CenterEntity,
  ): Promise<ApiResponse<UserResponseDto | CenterResponseDto>> {
    let memberResponseDto: UserResponseDto | CenterResponseDto;
    if (member instanceof UserEntity) {
      memberResponseDto = new UserResponseDto(member);
      this.logger.verbose(
        `Authenticated user accessing test route: ${member.signId}`,
      );
    } else {
      memberResponseDto = new CenterResponseDto(member);
      this.logger.verbose(
        `Authenticated center accessing test route: ${member.signId}`,
      );
    }

    return new ApiResponse(
      true,
      200,
      'You are authenticated',
      memberResponseDto,
    );
  }

  // 카카오 로그인 페이지 요청
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(@Req() req: Request) {
    // 이 부분은 Passport의 AuthGuard에 의해 카카오 로그인 페이지로 리다이렉트
  }

  // 카카오 로그인 콜백 엔드포인트
  @Get('/kakao/callback')
  async kakaoCallback(
    @Query('authorizationCode') kakaoAuthResCode: string,
    @Res() res: Response,
  ) {
    // Authorization Code 받기
    const { jwtToken, user } =
      await this.authService.signInWithKakao(kakaoAuthResCode);

    // 쿠키에 JWT 설정
    res.cookie('Authorization', jwtToken, {
      httpOnly: false, // 클라이언트 측 스크립트에서 쿠키 접근 금지
      secure: false, // HTTPS에서만 쿠키 전송, 임시 비활성화
      maxAge: 3600000, // 1시간
      sameSite: 'none', // CSRF 공격 방어
    });
    const userResponseDto = new UserResponseDto(user);

    this.logger.verbose(
      `User signed in successfully: ${JSON.stringify(userResponseDto)}`,
    );
    res.status(200).json(
      new ApiResponse(true, 200, 'Sign in successful', {
        jwtToken,
        user: userResponseDto,
      }),
    );
  }

  // 주소 검색
  @Get('address')
  async searchAddress(@Query('query') query: string) {
    return this.authService.searchAddress(query);
  }

  // 회원 탈퇴 엔드포인트
  @Post('/delete')
  @UseGuards(AuthGuard()) // JWT 인증이 필요한 엔드포인트
  async deleteUser(
    @GetUser() member: UserEntity | CenterEntity,
    @Body('password') password: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    this.logger.verbose(`Request to delete user: ${member.signId}`);

    await this.refreshTokenRepository.delete({ signId: member.signId });

    await this.authService.deleteUser(member.signId, password);

    return {
      success: true,
      message: 'User deleted successfully.',
    };
  }

  // refresh
  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.RefreshToken; // 쿠키에서 Refresh Token 가져오기

    if (!refreshToken) {
      this.logger.warn('No refresh token found in cookies');
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    try {
      // 쿠키에서 signId를 추출하거나, Refresh Token에서 직접 처리 가능
      const decodedToken = this.jwtService.decode(refreshToken) as any;
      const signId = decodedToken?.signId;
      if (!signId) {
        throw new UnauthorizedException('Invalid token payload.');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshAccessToken(signId, refreshToken);

      // 새 Access Token과 Refresh Token을 쿠키에 저장
      res.cookie('Authorization', accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000, // 1시간
        sameSite: 'none',
      });

      res.cookie('RefreshToken', newRefreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 3600000, // 7일
        sameSite: 'none',
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken,
      });
    } catch (error) {
      this.logger.error(`Failed to refresh token: ${error.message}`);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 로그아웃
  @Post('/signout')
  @UseGuards(AuthGuard())
  async logout(@GetUser() member: MemberEntity, @Res() res: Response) {
    await this.authService.revokeRefreshToken(member.signId);

    res.clearCookie('Authorization');
    res.clearCookie('RefreshToken');

    res.status(200).json({
      success: true,
      message: 'User logged out successfully.',
    });
  }
}
