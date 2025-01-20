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
  async centerSignUp(
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
    const isValid = await this.authService.checkBusinessIdValid(businessId);
    if (isValid) {
      this.logger.verbose(`businessId is valid: ${businessId}`);
      return { success: isValid, message: '유효한 사업자 등록 번호입니다.' };
    } else {
      this.logger.warn(`businessId is not valid: ${businessId}`);
      return {
        success: isValid,
        message: '유효하지 않은 사업자 등록 번호입니다.',
      };
    }
  }

  // 통합 로그인 엔드포인트
  @Post('/signin')
  async signIn(
    @Body() signInRequestDto: SignInRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.verbose(
      `Attempting to sign in user with signId: ${signInRequestDto.signId}`,
    );

    try {
      // [1] 로그인 처리
      const { accessToken, refreshToken, member } =
        await this.authService.signIn(signInRequestDto);

      const responseDto =
        member instanceof UserEntity
          ? new UserResponseDto(member)
          : new CenterResponseDto(member);

      this.logger.verbose(
        `User signed in successfully: ${JSON.stringify(responseDto)}`,
      );

      // [2] 응답 반환 JSON으로 토큰 전송
      res.status(200).json(
        new ApiResponse(true, 200, 'Sign in successful', {
          accessToken: accessToken, // 헤더로 사용할 Access Token
          refreshToken: refreshToken, // 클라이언트 보안 저장소에 저장할 Refresh Token
          member: responseDto,
        }),
      );
    } catch (error) {
      this.logger.error(`Signin failed: ${error.message}`);
      res
        .status(401)
        .json(
          new ApiResponse(false, 401, 'Sign in failed', {
            error: error.message,
          }),
        );
    }
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
    const { accessToken, refreshToken, user } =
      await this.authService.signInWithKakao(kakaoAuthResCode);

    const userResponseDto = new UserResponseDto(user);

    this.logger.verbose(
      `User signed in successfully: ${JSON.stringify(userResponseDto)}`,
    );
    res.status(200).json(
      new ApiResponse(true, 200, 'Sign in successful', {
        accessToken: accessToken, // 헤더로 사용할 Access Token
        refreshToken: refreshToken, // 클라이언트 보안 저장소에 저장할 Refresh Token
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
  @UseGuards(AuthGuard()) // JWT 인증이 필요한 엔드포인트
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.headers['authorization']?.split(' ')[1]; // 헤더에서 Refresh Token 추출

    if (!refreshToken) {
      this.logger.warn('No refresh token found in header');
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    try {
      // refresh token 에서 signId 추출출
      const decodedToken = this.jwtService.decode(refreshToken) as any;
      const signId = decodedToken?.signId;
      if (!signId) {
        throw new UnauthorizedException('Invalid token payload.');
      }
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshAccessToken(signId, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: accessToken,
        refreshToken: newRefreshToken,
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

    res.status(200).json({
      success: true,
      message: 'User logged out successfully.',
    });
  }
}
