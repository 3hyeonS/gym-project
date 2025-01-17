import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { UserSignUpRequestDto } from './dto/user-sign-up-request.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { CenterEntity } from './entity/center.entity';
import { CenterSignUpRequestDto } from './dto/center-sign-up-request.dto';
import { MemberEntity } from './entity/member.entity';
import { SignInRequestDto } from './dto/sign-in-request.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly API_URL =
    'https://dapi.kakao.com/v2/local/search/address.json';

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(CenterEntity)
    private centersRepository: Repository<CenterEntity>,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  // 일반 회원 가입
  async userSignUp(
    userSignUpRequestDto: UserSignUpRequestDto,
  ): Promise<UserEntity> {
    const { signId, userName, email, password, role } = userSignUpRequestDto;
    this.logger.verbose(`Attempting to sign up user with signId: ${signId}`);

    // signId 중복 확인
    // await this.checkSignIdExists(signId);

    // 이메일 중복 확인
    // await this.checkEmailExists(email);

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    const newUser = this.usersRepository.create({
      signId,
      userName,
      password: hashedPassword, // 해싱된 비밀번호 사용
      email,
      role,
    });

    const savedUser = await this.usersRepository.save(newUser);

    this.logger.verbose(`User signed up successfully with signId: ${signId}`);
    this.logger.debug(`User details: ${JSON.stringify(savedUser)}`);

    return savedUser;
  }

  // 센터 회원 가입
  async centerSignUp(
    centerSignUpRequestDto: CenterSignUpRequestDto,
  ): Promise<CenterEntity> {
    const {
      signId,
      centerName,
      ceoName,
      email,
      password,
      businessId,
      phone,
      address,
    } = centerSignUpRequestDto;
    this.logger.verbose(`Attempting to sign up user with signId: ${signId}`);

    // signId 중복 확인
    // await this.checkSignIdExists(signId);

    // 이메일 중복 확인
    // await this.checkEmailExists(email);

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    const newCenter = this.centersRepository.create({
      signId,
      centerName,
      ceoName,
      email,
      password: hashedPassword, // 해싱된 비밀번호 사용
      businessId,
      phone,
      address,
    });
    const savedCenter = await this.centersRepository.save(newCenter);

    this.logger.verbose(`User signed up successfully with signId: ${signId}`);
    this.logger.debug(`User details: ${JSON.stringify(savedCenter)}`);

    return savedCenter;
  }

  // 일반 회원 로그인
  async userSignIn(
    signInRequestDto: SignInRequestDto,
  ): Promise<{ jwtToken: string; user: UserEntity }> {
    const { signId, password } = signInRequestDto;
    this.logger.verbose(`Attempting to sign in user with signId: ${signId}`);

    try {
      const existingUser = await this.findMemberBySignId(signId);

      if (
        !existingUser ||
        existingUser instanceof CenterEntity ||
        !(await bcrypt.compare(password, existingUser.password))
      ) {
        this.logger.warn(`Failed login attempt for signId: ${signId}`);
        throw new UnauthorizedException('Incorrect signId or password.');
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

  // 센터 회원 로그인
  async centerSignIn(
    signInRequestDto: SignInRequestDto,
  ): Promise<{ jwtToken: string; center: CenterEntity }> {
    const { signId, password } = signInRequestDto;
    this.logger.verbose(`Attempting to sign in user with signId: ${signId}`);

    try {
      const existingCenter = await this.findMemberBySignId(signId);

      if (
        !existingCenter ||
        existingCenter instanceof UserEntity ||
        !(await bcrypt.compare(password, existingCenter.password))
      ) {
        this.logger.warn(`Failed login attempt for signId: ${signId}`);
        throw new UnauthorizedException('Incorrect signId or password.');
      }
      // [1] JWT 토큰 생성 (Secret + Payload)
      const jwtToken = await this.generateJwtToken(existingCenter);

      // [2] 사용자 정보 반환
      return { jwtToken, center: existingCenter };
    } catch (error) {
      this.logger.error('Signin failed', error.stack);
      throw error;
    }
  }

  // signId 중복 확인 메서드
  async checkSignIdExists(signId: string): Promise<void> {
    this.logger.verbose(`Checking if signId exists: ${signId}`);

    const existingMember = await this.findMemberBySignId(signId);
    if (existingMember) {
      this.logger.warn(`signId already exists: ${signId}`);
      throw new ConflictException('signId already exists');
    }
    this.logger.verbose(`signId is available: ${signId}`);
  }

  // signId로 멤버 찾기 메서드
  async findMemberBySignId(
    signId: string,
  ): Promise<UserEntity | CenterEntity | undefined> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { signId },
    });

    const center: CenterEntity = user
      ? null
      : await this.centersRepository.findOne({
          where: { signId },
        });

    return user || center;
  }

  // 이메일 중복 확인 메서드
  private async checkEmailExists(email: string): Promise<void> {
    this.logger.verbose(`Checking if email exists: ${email}`);

    const existingMember = await this.findMemberByEmail(email);
    if (existingMember) {
      this.logger.warn(`Email already exists: ${email}`);
      throw new ConflictException('Email already exists');
    }
    this.logger.verbose(`Email is available: ${email}`);
  }

  // 이메일로 멤버 찾기 메서드
  private async findMemberByEmail(
    email: string,
  ): Promise<UserEntity | CenterEntity | undefined> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { email },
    });

    const center: CenterEntity = user
      ? null
      : await this.centersRepository.findOne({
          where: { email },
        });

    return user || center;
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
    const temporaryId = uuidv4();
    const temporaryPassword = uuidv4(); // 랜덤 문자열 생성
    const hashedPassword = await this.hashPassword(temporaryPassword);

    // 새 사용자 생성 로직
    const newUser = this.usersRepository.create({
      signId: temporaryId,
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
      // client_secret: process.env.KAKAO_CLIENT_SECRET, // 필요시 사용
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
  async generateJwtToken(member: MemberEntity): Promise<string> {
    // [1] JWT 토큰 생성 (Secret + Payload)
    const payload = {
      singId: member.signId,
      email: member.email,
      userId: member.id,
      role: member.role,
    };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(`Generated JWT Token: ${accessToken}`);
    this.logger.debug(`User details: ${JSON.stringify(member)}`);
    return accessToken;
  }

  // 카카오 주소 검색색
  async searchAddress(query: string): Promise<any> {
    if (!query) {
      throw new HttpException(
        '검색어(query)가 필요합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // 카카오 API 호출
      const response = await firstValueFrom(
        this.httpService.get(this.API_URL, {
          headers: {
            Authorization: `KakaoAK ${process.env.KAKAO_CLIENT_ID}`,
          },
          params: { query },
        }),
      );

      // 결과 데이터를 클라이언트에 반환할 형식으로 가공
      return response.data.documents.map((item) => ({
        address: item.address_name,
        roadAddress: item.road_address
          ? item.road_address.address_name
          : '지번 주소 없음',
      }));
    } catch (error) {
      console.error('주소 검색 API 호출 오류:', error);
      throw new HttpException(
        error.response?.data?.message || '주소 검색 중 오류가 발생했습니다.',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
