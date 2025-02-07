import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { UserSignUpRequestDto } from './dto/user-sign-up-request.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom, lastValueFrom, retry } from 'rxjs';
import { CenterEntity } from './entity/center.entity';
import { CenterSignUpRequestDto } from './dto/center-sign-up-request.dto';
import { MemberEntity } from './entity/member.entity';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { RefreshTokenEntity } from './entity/refreshToken.entity';
import { addressResponseDto } from './dto/address-response.dto';
import { GymEntity } from 'src/gyms/entity/gyms.entity';
import { ExpiredGymEntity } from 'src/gyms/entity/expiredGyms.entity';
import { EmailService } from './email.service';
import { EmailCodeEntity } from './entity/emailCode.entity';
import { CenterModifyRequestDto } from './dto/center-modify-request.dto';
import { FindCenterSignIdRequestDto } from './dto/find-center-signId-request-dto';
import { SignIdRequestDto } from './dto/signId-request-dto';
import { EmailCodeConfirmRequestDto } from './dto/email-code-confirm-request.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(CenterEntity)
    private centersRepository: Repository<CenterEntity>,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(GymEntity)
    private gymRepository: Repository<GymEntity>,
    @InjectRepository(ExpiredGymEntity)
    private expiredGymRepository: Repository<ExpiredGymEntity>,
    @InjectRepository(EmailCodeEntity)
    private emailCodeRepository: Repository<EmailCodeEntity>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private emailService: EmailService,
  ) {}

  // 문자 출력
  getHello(): string {
    return 'Welcome Autorization';
  }

  // 이메일 인증 코드 전송
  async sendVerificationCode(email): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.emailService.sendVerificationToEmail(email, code);
    const createdCode = await this.emailCodeRepository.create({ code });
    await this.emailCodeRepository.save(createdCode);
  }

  // 인증 코드 확인
  async confirmVerificationCode(code: string) {
    const savedCode = await this.emailCodeRepository.findOneBy({ code });
    if (!savedCode) {
      return false;
    }
    await this.emailCodeRepository.delete({ code });
    return true;
  }

  // 센터 아이디 찾기
  async findCenterSignId(ceoName: string, businessId: string): Promise<string> {
    const center = await this.centersRepository.findOneBy({
      ceoName,
      businessId,
    });
    if (center) {
      return center.signId;
    }
    throw new BadRequestException(
      "There's no center entity with requested ceoName and businessId",
    );
  }

  // 센터 비밀번호 찾기 이메일 인증코드 전송
  async findCenterPassword(signId: string): Promise<void> {
    const center = await this.centersRepository.findOneBy({
      signId,
    });
    if (!center) {
      throw new BadRequestException(
        "There's no center entity with requested signId",
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.emailService.sendVerificationToEmail(center.email, code);

    const createdCode = await this.emailCodeRepository.create({ code });
    await this.emailCodeRepository.save(createdCode);
  }

  // 센터 비밀번호 찾기 이메일 인증코드 입력
  async newCenterPassword(signId: string, code: string): Promise<string> {
    const center = await this.centersRepository.findOneBy({
      signId,
    });
    if (!center) {
      throw new BadRequestException(
        "There's no center entity with requested signId",
      );
    }

    const savedCode = await this.emailCodeRepository.findOneBy({ code });
    if (savedCode) {
      const newPassword = `snpw@${code}te`;
      await this.centersRepository.update(center.id, {
        password: newPassword,
      });
      return newPassword;
    }
    throw new BadRequestException('Invalid code entered');
  }

  // 회원정보 수정을 위한 비밀번호 확인
  async isPasswordValid(
    member: UserEntity | CenterEntity,
    password: string,
  ): Promise<boolean> {
    if (member.password == password) {
      return true;
    }
    return false;
  }

  // 센터 회원정보 수정
  async modifyCenter(
    center: CenterEntity,
    centerModifyRequestDto: CenterModifyRequestDto,
  ): Promise<CenterEntity> {
    const id = center.id;
    await this.centersRepository.update(id, {
      ...centerModifyRequestDto,
    });
    const modifiedCenter = await this.centersRepository.findOne({
      where: { id },
    });
    return modifiedCenter;
  }

  // 일반 회원 가입
  async userSignUp(
    userSignUpRequestDto: UserSignUpRequestDto,
  ): Promise<UserEntity> {
    const { signId, userName, email, password, role } = userSignUpRequestDto;

    // signId 중복 확인
    await this.checkSignIdExists(signId);

    // email 중복 확인
    await this.checkEmailExists(email);

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

    // signId 중복 확인
    await this.checkSignIdExists(signId);

    // email 중복 확인
    await this.checkEmailExists(email);

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

    return savedCenter;
  }

  // 통합 로그인 메서드
  async signIn(signInRequestDto: SignInRequestDto): Promise<{
    accessToken: string;
    refreshToken: string;
    member: UserEntity | CenterEntity;
  }> {
    const { signId, password } = signInRequestDto;

    // [1] 회원 정보 조회
    const existingMember = await this.findMemberBySignId(signId);

    if (
      !existingMember ||
      !(await bcrypt.compare(password, existingMember.password))
    ) {
      this.logger.error('Signin failed: Incorrect signId or password');
      throw new UnauthorizedException('Incorrect signId or password');
    }

    // [2] 회원 유형 판별 및 토큰 생성
    const accessToken = await this.generateJwtToken(existingMember);
    const refreshToken = await this.generateRefreshToken(existingMember);

    // [3] 사용자 정보 반환
    return { accessToken, refreshToken, member: existingMember };
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
    const existingMember = await this.findMemberByEmail(email);
    if (existingMember) {
      throw new ConflictException('Email already exists');
    }
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

    // signId, password 필드에 랜덤 문자열 생성
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
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    try {
      // Authorization Code로 Kakao API에 Access Token 요청
      const kakaoAccessToken = await this.getKakaoAccessToken(kakaoAuthResCode);

      // Access Token으로 Kakao 사용자 정보 요청
      const kakaoUserInfo = await this.getKakaoUserInfo(kakaoAccessToken);

      // 카카오 사용자 정보를 기반으로 회원가입 또는 로그인 처리
      const user = await this.signUpWithKakao(
        kakaoUserInfo.id.toString(),
        kakaoUserInfo,
      );

      // [1] JWT 토큰 생성 (Secret + Payload)
      const accessToken = await this.generateJwtToken(user);
      const refreshToken = await this.generateRefreshToken(user);
      // [2] 사용자 정보 반환
      return { accessToken, refreshToken, user };
    } catch (error) {
      throw new UnauthorizedException('Authorization code is Invalid');
    }
  }

  // Kakao Authorization Code로 Kakao Access Token 요청
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

  // Kakao Access Token으로 Kakao 사용자 정보 요청
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
      signId: member.signId,
      email: member.email,
      userId: member.id,
      role: member.role,
    };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(`Generated JWT Token: ${accessToken}`);
    this.logger.debug(`User details: ${JSON.stringify(member)}`);
    return accessToken;
  }

  // Refresh Token 생성 및 저장
  async generateRefreshToken(member: MemberEntity): Promise<string> {
    const payload = { signId: member.signId, iat: Date.now() };
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // 만료 시간 (7일)
    }); // Refresh Token 생성
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 만료

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      signId: member.signId,
      expiresAt,
      user: member instanceof UserEntity ? member : null,
      center: member instanceof CenterEntity ? member : null,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);
    return refreshToken;
  }

  // Refresh Token 검증
  async validateRefreshToken(
    signId: string,
    refreshToken: string,
  ): Promise<UserEntity | CenterEntity> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, signId },
      relations: ['user', 'center'],
    });

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refreshToken');
    }

    return tokenEntity.user || tokenEntity.center;
  }

  // 해당 refresh Token 삭제 (로그아웃 시)
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });
    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refreshToken');
    } else {
      await this.refreshTokenRepository.delete({ token: refreshToken });
    }
  }

  // 해당 아이디의 모든 refresh token 삭제 (회원 탈퇴 시)
  async revokeRefreshTokenBySignId(signId: string): Promise<void> {
    // const tokenEntities = await this.refreshTokenRepository.find({
    //   where: { signId: signId },
    // });
    // if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
    //   throw new UnauthorizedException('Invalid or expired refreshToken');
    // } else {
    await this.refreshTokenRepository.delete({ signId: signId });
  }

  // 만료된 refresh token 삭제
  async removeExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepository.delete({ expiresAt: LessThan(now) });
  }

  // Access Token 갱신
  async refreshAccessToken(
    signId: string,
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    member: UserEntity | CenterEntity;
  }> {
    const member = await this.validateRefreshToken(signId, refreshToken);

    // 새 Access Token 생성
    const newAccessToken = await this.generateJwtToken(member);

    // 새 Refresh Token 생성
    const newRefreshToken = await this.generateRefreshToken(member);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      member: member,
    };
  }

  // 카카오 주소 검색
  async searchAddress(query: string): Promise<addressResponseDto> {
    if (!query) {
      throw new HttpException(
        '검색어(query)가 필요합니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const api_url = 'https://dapi.kakao.com/v2/local/search/address.json';

    try {
      // 카카오 API 호출
      const response = await firstValueFrom(
        this.httpService.get(api_url, {
          headers: {
            Authorization: `KakaoAK ${process.env.KAKAO_CLIENT_ID}`,
          },
          params: { query },
        }),
      );

      // 결과 데이터를 클라이언트에 반환할 형식으로 가공
      return response.data.documents.map((item) => ({
        postalCode: item.road_address?.zone_no || '우편번호 없음',
        address: item.address ? item.address.address_name : '지번 주소 없음',
        roadAddress: item.road_address
          ? item.road_address.address_name
          : '도로명 주소 없음',
      }));
    } catch (error) {
      console.error('주소 검색 API 호출 오류:', error);
      throw new HttpException(
        error.response?.data?.message || '주소 검색 중 오류가 발생했습니다.',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 회원 탈퇴 기능
  async deleteUser(
    member: UserEntity | CenterEntity,
    signId: string,
  ): Promise<void> {
    //해당 signId의 모든 refreshToken 삭제
    this.revokeRefreshTokenBySignId(signId);

    // 탈퇴 처리
    if (member instanceof UserEntity) {
      await this.usersRepository.delete({ signId: signId });
      console.log('user deleted');
    } else {
      await this.gymRepository.delete({ center: member });
      await this.expiredGymRepository.delete({ center: member });
      await this.centersRepository.delete({ signId: signId });
      console.log('center deleted');
    }

    this.logger.verbose(`User deleted successfully with signId: ${signId}`);
  }

  //사업자등록번호 유효성 검사
  async checkBusinessIdValid(businessId: string): Promise<any> {
    const apiKey = process.env.API_KEY; // 발급받은 API 키 입력
    const url = `http://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${apiKey}`; // API 엔드포인트
    const cleanedBusinessId = businessId.replace(/-/g, ''); //하이픈 제거
    const params = {
      b_no: [cleanedBusinessId], // 사업자등록번호
    };

    try {
      const response = await lastValueFrom(
        this.httpService
          .post(url, params, { timeout: 5000 }) // 5초 제한
          .pipe(retry(3)), // 최대 3번 재시도
      );
      const item = response.data.data[0];
      const filteredData = {
        businessId: item.b_no.replace(/^(\d{3})(\d{2})(\d{5})$/, '$1-$2-$3'), // 사업자등록번호
        businessStatus: item.b_stt || '상태 없음', // 사업자 상태 (없으면 기본값)
        businessStatusCode: item.b_stt_cd || '상태 코드 없음', // 사업자 상태 코드
        taxType: item.tax_type, // 세금 유형
        isValid: item.b_stt_cd === '01',
      };
      return filteredData;
    } catch (error) {
      console.log(error.response?.data);
      throw new HttpException(
        error.response?.data || 'API 요청 실패',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
