import {
  ConflictException,
  Injectable,
  Logger,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import * as bcrypt from 'bcryptjs';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  // 회원 가입
  async signUp(signUpRequestDto: SignUpRequestDto): Promise<UserEntity> {
    const { userName, password, email, role } = signUpRequestDto;
    this.logger.verbose(`Attempting to sign up user with email: ${email}`);

    // 이메일 중복 확인
    await this.checkEmailExists(email);

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    const newUser = this.usersRepository.create({
      userName,
      password: hashedPassword, // 해싱된 비밀번호 사용
      email,
      role,
    });

    const savedUser = await this.usersRepository.save(newUser);

    this.logger.verbose(`User signed up successfully with email: ${email}`);
    this.logger.debug(`User details: ${JSON.stringify(savedUser)}`);

    return savedUser;
  }

  // 로그인
  async signIn(
    signInRequestDto: SignInRequestDto,
  ): Promise<{ jwtToken: string; user: UserEntity }> {
    const { email, password } = signInRequestDto;
    this.logger.verbose(`Attempting to sign in user with email: ${email}`);

    try {
      const existingUser = await this.findUserByEmail(email);

      if (
        !existingUser ||
        !(await bcrypt.compare(password, existingUser.password))
      ) {
        this.logger.warn(`Failed login attempt for email: ${email}`);
        throw new UnauthorizedException('Incorrect email or password.');
      }
      // [1] JWT 토큰 생성 (Secret + Payload)
      const jwtToken = await this.generateJwtToken(existingUser);

      // [2] 사용자 정보 반환
      return { jwtToken, user: existingUser };
    } catch (error) {
      this.logger.error('Signin failed', error.stack);
      throw error;
    }
  }

  // 이메일 중복 확인 메서드
  private async checkEmailExists(email: string): Promise<void> {
    this.logger.verbose(`Checking if email exists: ${email}`);

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      this.logger.warn(`Email already exists: ${email}`);
      throw new ConflictException('Email already exists');
    }
    this.logger.verbose(`Email is available: ${email}`);
  }

  // 이메일로 유저 찾기 메서드
  private async findUserByEmail(
    email: string,
  ): Promise<UserEntity | undefined> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  // 비밀번호 해싱 암호화 메서드
  private async hashPassword(password: string): Promise<string> {
    this.logger.verbose(`Hashing password`);

    const salt = await bcrypt.genSalt(); // 솔트 생성
    return await bcrypt.hash(password, salt); // 비밀번호 해싱
  }

  // 카카오 정보 회원 가입
  async signUpWithKakao(kakaoId: string, profile: any): Promise<UserEntity> {
    const kakaoAccount = profile.kakao_account;

    const kakaoUsername = kakaoAccount.name;
    const kakaoEmail = kakaoAccount.email;

    // 카카오 프로필 데이터를 기반으로 사용자 찾기 또는 생성 로직을 구현
    const existingUser = await this.usersRepository.findOne({
      where: { email: kakaoEmail },
    });
    if (existingUser) {
      return existingUser;
    }

    // 비밀번호 필드에 랜덤 문자열 생성
    const temporaryPassword = uuidv4(); // 랜덤 문자열 생성
    const hashedPassword = await this.hashPassword(temporaryPassword);

    // 새 사용자 생성 로직
    const newUser = this.usersRepository.create({
      userName: kakaoUsername,
      email: kakaoEmail,
      password: hashedPassword, // 해싱된 임시 비밀번호 사용

      // 기타 필요한 필드 설정
      role: 'USER',
    });
    return this.usersRepository.save(newUser);
  }

  // 카카오 로그인
  async signInWithKakao(
    kakaoAuthResCode: string,
  ): Promise<{ jwtToken: string; user: UserEntity }> {
    // Authorization Code로 Kakao API에 Access Token 요청
    const accessToken = await this.getKakaoAccessToken(kakaoAuthResCode);

    // Access Token으로 Kakao 사용자 정보 요청
    const kakaoUserInfo = await this.getKakaoUserInfo(accessToken);

    // 카카오 사용자 정보를 기반으로 회원가입 또는 로그인 처리
    const user = await this.signUpWithKakao(
      kakaoUserInfo.id.toString(),
      kakaoUserInfo,
    );

    // [1] JWT 토큰 생성 (Secret + Payload)
    const jwtToken = await this.generateJwtToken(user);

    // [2] 사용자 정보 반환
    return { jwtToken, user };
  }

  // Kakao Authorization Code로 Access Token 요청
  async getKakaoAccessToken(code: string): Promise<string> {
    const tokenUrl = 'https://kauth.kakao.com/oauth/token';
    const payload = {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID, // Kakao REST API Key
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      code,
      client_secret: process.env.KAKAO_CLIENT_SECRET, // 필요시 사용
    };

    const response = await firstValueFrom(
      this.httpService.post(tokenUrl, null, {
        params: payload,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    return response.data.access_token; // Access Token 반환
  }

  // Access Token으로 Kakao 사용자 정보 요청
  async getKakaoUserInfo(accessToken: string): Promise<any> {
    const userInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const response = await firstValueFrom(
      this.httpService.get(userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    this.logger.debug(`Kakao User Info: ${JSON.stringify(response.data)}`); // 데이터 확인
    return response.data;
  }

  // JWT 생성 공통 메서드
  async generateJwtToken(user: UserEntity): Promise<string> {
    // [1] JWT 토큰 생성 (Secret + Payload)
    const payload = {
      email: user.email,
      userId: user.id,
      role: user.role,
    };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(`Generated JWT Token: ${accessToken}`);
    this.logger.debug(`User details: ${JSON.stringify(user)}`);
    return accessToken;
  }
}
