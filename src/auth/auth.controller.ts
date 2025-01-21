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
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignUpRequestDto } from './dto/user-sign-up-request.dto';
import { UserEntity } from './entity/user.entity';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user-decorator';
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
import {
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseTransformInterceptor } from 'src/interceptors/response-transform-interceptor';
import { ResponseMsg } from 'src/decorators/response-message-decorator';
import { ResponseDto } from 'src/response-dto';
import { GenericApiResponse } from 'src/decorators/generic-api-response-decorator';
import { addressResponseDto } from './dto/address-response.dto';

@ApiTags('Authorization')
@UseInterceptors(ResponseTransformInterceptor)
@ApiExtraModels(ResponseDto)
@Controller('/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성

  constructor(
    private authService: AuthService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService, // JwtService 주입
  ) {}

  //문자 출력
  @ApiOperation({
    summary: 'Welcome Authorization 출력',
    description: 'Welcome Authorization 출력',
  })
  @Get()
  @ApiResponse({
    status: 200,
    description: '성공적으로 문자를 출력했습니다.',
    content: {
      'application/json': {
        example: {
          message: '성공적으로 문자를 출력했습니다.',
          statusCode: 200,
          data: 'Welcome Authorization',
        },
      },
    },
  })
  @ResponseMsg('성공적으로 문자를 출력했습니다.')
  getHello(): string {
    return this.authService.getHello();
  }

  // 일반 회원 가입 기능
  @ApiOperation({
    summary: '회원가입(유저)',
    description: '일반유저, 관리자 회원가입',
  })
  @ResponseMsg('회원가입에 성공했습니다.')
  @GenericApiResponse({
    status: 201,
    description: '회원가입에 성공했습니다.',
    model: UserResponseDto,
  })
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

  // 센터 회원 가입 기능
  @ApiOperation({
    summary: '회원가입(센터)',
    description: '센터 회원가입',
  })
  @ResponseMsg('회원가입에 성공했습니다.')
  @GenericApiResponse({
    status: 201,
    description: '회원가입에 성공했습니다.',
    model: CenterResponseDto,
  })
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
      `User signed up successfully: ${JSON.stringify(centerResponseDto)}`,
    );
    return centerResponseDto;
  }

  // signId 중복 체크
  @ApiOperation({
    summary: '아이디 중복 검사',
    description: '기존 회원(유저, 센터, 관리자 모두)과의 signId 중복 여부',
  })
  @ResponseMsg('아이디 중복 검사 완료')
  @ApiResponse({
    status: 200,
    description:
      '아이디 중복 검사 완료  \ntrue: 사용 가능한 아이디  \nfalse: 사용 불가능한 아이디',
    content: {
      'application/json': {
        example: {
          message: '아이디 중복 검사를 완료했습니다.',
          statusCode: 200,
          data: 'true',
        },
      },
    },
  })
  @Post('/signup/checkId')
  async checkSignIdExists(@Body('signId') signId: string): Promise<boolean> {
    this.logger.verbose(`Checking if signId exists: ${signId}`);
    try {
      // signId 중복 확인
      await this.authService.checkSignIdExists(signId);
      this.logger.verbose(`signId is available: ${signId}`);
      return true;
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.warn(`signId already exists: ${signId}`);
        return false;
      }

      this.logger.error(`Error checking signId: ${error.message}`);
      throw error; // 다른 예외는 그대로 throw
    }
  }

  //사업자 등록 번호 유효성 검사
  @ApiOperation({
    summary: '사업자 등록 번호 유효성 검사',
    description: '사업자 등록 번호의 유효성 여부',
  })
  @ResponseMsg('사업자 등록 번호 유효성 검사 완료')
  @ApiResponse({
    status: 200,
    description:
      '사업자 등록 번호 유효성 검사를 완료했습니다.  \ntrue: 유효한 사업자 등록 번호  \nfalse: 유효하지 않은 사업자 등록 번호',
    content: {
      'application/json': {
        example: {
          message: '사업자 등록 번호 유효성 검사를 완료했습니다.',
          statusCode: 200,
          data: 'true',
        },
      },
    },
  })
  @Post('/signup/checkBusinessId')
  async checkBusinessIdValid(
    @Body('businessId') businessId: string,
  ): Promise<boolean> {
    const isValid = await this.authService.checkBusinessIdValid(businessId);
    if (isValid) {
      this.logger.verbose(`businessId is valid: ${businessId}`);
      return isValid;
    } else {
      this.logger.warn(`businessId is not valid: ${businessId}`);
      return isValid;
    }
  }

  // 주소 검색
  @ApiOperation({
    summary: '주소 검색',
    description: '주소 검색 시 상세 주소값 후보 반환',
  })
  @ResponseMsg('주소 검색 완료')
  @GenericApiResponse({
    status: 200,
    description: '성공적으로 상세 주소값 후보들을 반환했습니다.',
    model: addressResponseDto,
    isArray: true,
  })
  @Get('address')
  async searchAddress(@Query('query') query: string) {
    return this.authService.searchAddress(query);
  }

  // 통합 로그인 엔드포인트
  @ApiOperation({
    summary: '통합 로그인',
    description: '유저, 관리자, 센터 통합 로그인',
  })
  @ResponseMsg('로그인 성공')
  @ApiResponse({
    status: 200,
    description: '로그인에 성공했습니다.',
    content: {
      'application/json': {
        example: {
          message: '로그인에 성공했습니다.',
          statusCode: 200,
          data: {
            acccessToken: 'adfda',
            refreshToken: 'dsafdsa',
          },
        },
      },
    },
  })
  @Post('/signin')
  async signIn(@Body() signInRequestDto: SignInRequestDto): Promise<{
    member: UserResponseDto | CenterResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {
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
        `${member.role} signed in successfully: ${JSON.stringify(responseDto)}`,
      );

      // [2] 응답 반환 JSON으로 토큰 전송
      return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        member,
      };
    } catch (error) {
      this.logger.error(`Signin failed: ${error.message}`);
      return error.message;
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

  // 카카오 로그인 페이지 요청
  @ApiOperation({
    summary: '카카오 로그인 페이지',
    description: '카카오 로그인 페이지로 리다이렉트',
  })
  @ResponseMsg('카카오 로그인 페이지 요청 성공')
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(@Req() req: Request) {
    // 이 부분은 Passport의 AuthGuard에 의해 카카오 로그인 페이지로 리다이렉트
  }

  // 카카오 로그인 콜백 엔드포인트
  @ApiOperation({
    summary: '카카오 로그인 콜백',
    description: '카카오 로그인 콜백 및 accessToken, refreshToken 생성',
  })
  @ResponseMsg('카카오 로그인 성공')
  @Get('/kakao/callback')
  async kakaoCallback(
    @Query('code') kakaoAuthResCode: string,
    @Res() res: Response,
  ): Promise<{
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
  @ApiOperation({
    summary: '로그 아웃',
    description: '로그 아웃 및 refreshToken 삭제',
  })
  @ResponseMsg('로그아웃 성공')
  @Post('/signout')
  @UseGuards(AuthGuard())
  async logout(@GetUser() member: MemberEntity, @Res() res: Response) {
    await this.authService.revokeRefreshToken(member.signId);
  }

  // 회원 탈퇴 엔드포인트
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '회원 탈퇴 및 refreshToken 삭제',
  })
  @ResponseMsg('회원 탈퇴 성공')
  @Post('/delete')
  @UseGuards(AuthGuard()) // JWT 인증이 필요한 엔드포인트
  async deleteUser(
    @GetUser() member: UserEntity | CenterEntity,
    @Body('password') password: string,
  ) {
    this.logger.verbose(`Request to delete user: ${member.signId}`);

    await this.refreshTokenRepository.delete({ signId: member.signId });

    await this.authService.deleteUser(member.signId, password);
  }

  // refresh
  @ApiOperation({
    summary: '토큰 재발급',
    description: 'accessToken 기간 만료 시 accessToken 및 refreshToken 재발급',
  })
  @Post('/refresh')
  @ResponseMsg('토큰 재발급 성공')
  @UseGuards(AuthGuard()) // JWT 인증이 필요한 엔드포인트
  async refresh(
    @Req() req: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = req.headers['authorization']?.split(' ')[1]; // 헤더에서 Refresh Token 추출

    if (!refreshToken) {
      throw new UnauthorizedException('보유한 refreshToken 없음');
    }

    try {
      // refresh token 에서 signId 추출
      const decodedToken = this.jwtService.decode(refreshToken) as any;
      const signId = decodedToken?.signId;
      if (!signId) {
        throw new UnauthorizedException('유효하지 않은 refreshToken');
      }
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refreshAccessToken(signId, refreshToken);

      return {
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      this.logger.error(`Failed to refresh token: ${error.message}`);
      return error.message;
    }
  }
}
