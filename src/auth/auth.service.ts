import {
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
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
import { Gym2Entity } from 'src/gyms/entity/gyms2.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CenterEntity)
    private centerRepository: Repository<CenterEntity>,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(GymEntity)
    private gymRepository: Repository<GymEntity>,
    @InjectRepository(Gym2Entity)
    private gym2Repository: Repository<Gym2Entity>,
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
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3); // 3분 뒤 만료
    await this.emailCodeRepository.delete({ email });
    const createdCode = this.emailCodeRepository.create({
      email,
      code,
      expiresAt,
    });
    await this.emailCodeRepository.save(createdCode);
  }

  // 인증 코드 확인
  async confirmVerificationCode(email: string, code: string): Promise<boolean> {
    const savedCode = await this.emailCodeRepository.findOneBy({ email, code });
    const now = new Date();
    if (!savedCode) {
      return false;
    }
    if (savedCode.expiresAt < now) {
      throw new GoneException('Verification code has expired'); // 410 Gone 사용
    }

    await this.emailCodeRepository.delete({ email, code });
    await this.emailCodeRepository.delete({ expiresAt: LessThan(now) }); // 만료된 코드들 삭제
    return true;
  }

  // 센터 아이디 찾기
  async findCenterSignId(ceoName: string, businessId: string): Promise<string> {
    const center = await this.centerRepository.findOneBy({
      ceoName,
      businessId,
    });
    if (center) {
      return center.signId;
    }
    throw new NotFoundException(
      'There is no center entity with requested ceoName and businessId',
    );
  }

  // 센터 비밀번호 찾기 이메일 인증코드 전송
  async findCenterPassword(signId: string): Promise<string> {
    const center = await this.centerRepository.findOneBy({
      signId,
    });
    if (!center) {
      throw new NotFoundException(
        'There is no center entity with requested signId',
      );
    }

    const email = center.email;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.emailService.sendVerificationToEmail(email, code);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3); // 3분 뒤 만료

    const createdCode = this.emailCodeRepository.create({
      email,
      code,
      expiresAt,
    });
    await this.emailCodeRepository.save(createdCode);
    return email;
  }

  // 센터 새로운 비밀번호 입력
  async newCenterPassword(signId: string, newPassword: string): Promise<void> {
    const center = await this.centerRepository.findOneBy({
      signId,
    });
    if (!center) {
      throw new NotFoundException(
        "There's no center entity with requested signId",
      );
    }
    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(newPassword);
    await this.centerRepository.update(center.id, {
      password: hashedPassword,
    });
  }

  // 회원정보 수정을 위한 비밀번호 확인
  async isPasswordValid(
    member: UserEntity | CenterEntity,
    password: string,
  ): Promise<boolean> {
    if (await bcrypt.compare(password, member.password)) {
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
    if (centerModifyRequestDto.password) {
      const hashedPassword = await this.hashPassword(
        centerModifyRequestDto.password,
      );
      await this.centerRepository.update(id, {
        password: hashedPassword,
        ceoName: centerModifyRequestDto.ceoName,
        address: centerModifyRequestDto.address,
        phone: centerModifyRequestDto.phone,
      });
    } else {
      await this.centerRepository.update(id, {
        ...centerModifyRequestDto,
      });
    }

    const modifiedCenter = await this.centerRepository.findOne({
      where: { id },
    });
    return modifiedCenter;
  }

  // 일반 회원 가입
  async userSignUp(
    userSignUpRequestDto: UserSignUpRequestDto,
  ): Promise<UserEntity> {
    const { signId, nickname, email, password, role } = userSignUpRequestDto;

    // signId 중복 확인
    await this.checkSignIdExists(signId);

    // email 중복 확인
    await this.checkEmailExists(email);

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    const newUser = this.userRepository.create({
      signId,
      nickname: nickname,
      password: hashedPassword, // 해싱된 비밀번호 사용
      email,
      role,
    });

    const savedUser = await this.userRepository.save(newUser);
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

    // businessId 중복 확인

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    const newCenter = this.centerRepository.create({
      signId,
      centerName,
      ceoName,
      email,
      password: hashedPassword, // 해싱된 비밀번호 사용
      businessId,
      phone,
      address,
    });
    const savedCenter = await this.centerRepository.save(newCenter);

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
      throw new UnauthorizedException('Incorrect signId or password');
    }

    // [2] 회원 유형 판별 및 토큰 생성
    const accessToken = await this.generateAccessToken(existingMember);
    const refreshToken = await this.generateRefreshToken(existingMember);

    // [3] 사용자 정보 반환
    return { accessToken, refreshToken, member: existingMember };
  }

  // signId 중복 확인 메서드
  async checkSignIdExists(signId: string): Promise<void> {
    const existingMember = await this.findMemberBySignId(signId);
    if (existingMember) {
      throw new ConflictException('signId already exists');
    }
  }

  // signId로 멤버 찾기 메서드
  async findMemberBySignId(
    signId: string,
  ): Promise<UserEntity | CenterEntity | undefined> {
    const user: UserEntity = await this.userRepository.findOne({
      where: { signId },
    });

    const center: CenterEntity = user
      ? null
      : await this.centerRepository.findOne({
          where: { signId },
        });
    return user || center;
  }

  // 이메일 중복 확인 메서드
  async checkEmailExists(email: string): Promise<void> {
    const existingMember = await this.findMemberByEmail(email);
    if (existingMember) {
      throw new ConflictException('email already exists');
    }
  }

  // 이메일로 멤버 찾기 메서드
  private async findMemberByEmail(
    email: string,
  ): Promise<UserEntity | CenterEntity | undefined> {
    const user: UserEntity = await this.userRepository.findOne({
      where: { email },
    });

    const center: CenterEntity = user
      ? null
      : await this.centerRepository.findOne({
          where: { email },
        });

    return user || center;
  }

  // 비밀번호 해싱 암호화 메서드
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(); // 솔트 생성
    return await bcrypt.hash(password, salt); // 비밀번호 해싱
  }

  // 카카오 정보 회원 가입
  async signUpWithKakao(kakaoId: string, profile: any): Promise<UserEntity> {
    const kakaoAccount = profile.kakao_account;

    const kakaoUserNickname = kakaoAccount.profile.nickname;
    const kakaoEmail = kakaoAccount.email;

    // 카카오 프로필 데이터를 기반으로 사용자 찾기 또는 생성 로직을 구현
    const existingUser = await this.userRepository.findOne({
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
    const newUser = this.userRepository.create({
      signId: temporaryId,
      nickname: kakaoUserNickname,
      email: kakaoEmail,
      password: hashedPassword, // 해싱된 임시 비밀번호 사용

      // 기타 필요한 필드 설정
      role: 'USER',
    });
    return await this.userRepository.save(newUser);
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
      const accessToken = await this.generateAccessToken(user);
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

  // accessToken 생성 공통 메서드
  async generateAccessToken(member: MemberEntity): Promise<string> {
    // [1] JWT 토큰 생성 (Secret + Payload)
    const payload = {
      signId: member.signId,
      email: member.email,
      userId: member.id,
      role: member.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRATION,
    });
    return accessToken;
  }

  // Refresh Token 생성 및 저장
  async generateRefreshToken(member: MemberEntity): Promise<string> {
    const payload = { signId: member.signId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRATION,
    }); // Refresh Token 생성
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 만료
    // expiresAt.setMinutes(expiresAt.getMinutes() + 3);

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
    const newAccessToken = await this.generateAccessToken(member);

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
      const message = error.message;
      if (message.indexOf('401')) {
        throw new UnauthorizedException('KAKAO_CLIENT_ID is invalid');
      } else if (message.indexOf('403')) {
        throw new ForbiddenException('App disabled OPEN_MAP_AND_LOCAL service');
      } else {
        throw error;
      }
    }
  }

  // 회원 탈퇴 기능
  async deleteUser(
    member: UserEntity | CenterEntity,
    signId: string,
  ): Promise<void> {
    //해당 signId의 모든 refreshToken 삭제
    await this.revokeRefreshTokenBySignId(signId);

    // 탈퇴 처리
    if (member instanceof UserEntity) {
      await this.userRepository.delete({ signId: signId });
    } else {
      await this.gymRepository.update(
        { center: member },
        { center: null, apply: null },
      );

      // 디비 업데이트용
      await this.gym2Repository.update(
        { center: member },
        { center: null, apply: null },
      );

      await this.expiredGymRepository.delete({ center: member });
      await this.centerRepository.delete({ signId: signId });
    }
  }

  // 사업자 등록번호 중복 검사
  async checkBusinessIdExists(businessId: string): Promise<void> {
    const center = await this.centerRepository.findOneBy({ businessId });
    if (center) {
      throw new ConflictException('businessId already exists');
    }
  }

  // 사업자등록번호 중복 및 유효성 검사
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
        error.response?.data?.message || 'API 요청 실패',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 애플 공개 키를 PEM 형식으로 변환
  private convertAppleKeyToPEM(key: any): string {
    return `-----BEGIN PUBLIC KEY-----\n${key.n}\n-----END PUBLIC KEY-----`;
  }

  // ✅ 애플 ID 토큰 검증 (HttpService 활용)
  async verifyAppleIdToken(idToken: string): Promise<any> {
    // 애플 공개 키 가져오기 (axios 없이 HttpService 사용)
    const appleKeysUrl = 'https://appleid.apple.com/auth/keys';
    const { data } = await firstValueFrom(this.httpService.get(appleKeysUrl));
    const keys = data.keys;

    // ID 토큰의 헤더를 디코딩하여 해당하는 키 찾기
    const decodedHeader: any = this.jwtService.decode(idToken, {
      complete: true,
    });
    if (!decodedHeader) {
      throw new UnauthorizedException('Invalid Apple ID Token');
    }

    const key = keys.find((k) => k.kid === decodedHeader.header.kid);
    if (!key) {
      throw new UnauthorizedException('Invalid Apple ID Token');
    }

    // 애플 공개 키를 PEM 형식으로 변환
    const publicKey = this.convertAppleKeyToPEM(key);

    // ID 토큰 검증 및 사용자 정보 추출
    try {
      const payload = this.jwtService.verify(idToken, {
        publicKey,
        algorithms: ['RS256'],
      });

      return {
        sub: payload.sub, // 애플 유저 ID
        email: payload.email, // 이메일 (사용자가 이메일 공유 동의한 경우)
        name: payload.name, // 사용자가 제공한 이름 (선택 사항)
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Apple ID Token');
    }
  }

  // 애플 정보 기반 회원가입 또는 로그인 처리
  async signUpWithApple(appleUserInfo: any): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: appleUserInfo.email },
    });

    if (existingUser) {
      return existingUser;
    }

    // 임시 비밀번호 생성
    const temporaryPassword = uuidv4();
    const hashedPassword = await this.hashPassword(temporaryPassword);

    const newUser = this.userRepository.create({
      signId: appleUserInfo.sub,
      email: appleUserInfo.email,
      password: hashedPassword,
      nickname: appleUserInfo.name || 'Apple User',
      role: 'USER',
    });

    return await this.userRepository.save(newUser);
  }

  // // 애플 로그인 처리
  // async signInWithApple(
  //   appleAuthResCode: string,
  //   idToken: string,
  // ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
  //   try {
  //     // ID 토큰 검증 및 사용자 정보 추출
  //     const appleUserInfo = await this.verifyAppleIdToken(idToken);
  //     if (!appleUserInfo) {
  //       throw new UnauthorizedException('Invalid Apple ID Token');
  //     }

  //     // 회원가입 또는 로그인 처리
  //     const user = await this.signUpWithApple(appleUserInfo);

  //     // JWT 토큰 생성
  //     const accessToken = await this.generateAccessToken(user);
  //     const refreshToken = await this.generateRefreshToken(user);

  //     return { accessToken, refreshToken, user };
  //   } catch (error) {
  //     throw new UnauthorizedException('Apple login failed');
  //   }
  // }

  // async signInWithApple(authCode: string) {
  //   const tokenEndpoint = 'https://appleid.apple.com/auth/token';
  //   const clientSecret = this.generateAppleClientSecret(); // 🔥 Apple Client Secret 생성

  //   const params = new URLSearchParams();
  //   params.append('grant_type', 'authorization_code');
  //   params.append('code', authCode);
  //   params.append('client_id', process.env.APPLE_CLIENT_ID);
  //   params.append('client_secret', clientSecret);
  //   params.append('redirect_uri', process.env.APPLE_CALLBACK_URL);

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.post(tokenEndpoint, params.toString(), {
  //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //       })
  //     );

  //     console.log('Apple Token Response:', response.data); // ✅ 디버깅
  //     return response.data; // id_token, access_token 포함됨
  //   } catch (error) {
  //     console.error(
  //       'Error fetching Apple ID Token:',
  //       error.response?.data || error.message
  //     );
  //     throw new UnauthorizedException('Failed to get Apple ID Token');
  //   }
  // }

  // // 애플 `client_secret` 생성
  // private generateAppleClientSecret(): Promise<string> {
  //   const payload = {
  //     iss: process.env.APPLE_TEAM_ID, // 🔥 Apple Developer Team ID
  //     iat: Math.floor(Date.now() / 1000), // 현재 시간 (초 단위)
  //     exp: Math.floor(Date.now() / 1000) + 3600, // 1시간 후 만료
  //     aud: 'https://appleid.apple.com', // 고정 값
  //     sub: process.env.APPLE_CLIENT_ID, // 서비스 ID (client_id)
  //   };

  //   return await this.jwtService.signAsync(payload, {
  //     algorithm: 'ES256', // Apple OAuth 요구 사항
  //     key: process.env.APPLE_PRIVATE_KEY_STRING.replace(/\\n/g, '\n'), // 🔥 개행 변환
  //     keyid: process.env.APPLE_KEY_ID, // 🔥 Apple Key ID
  //   } as any);
  // }

  async registerByIDtoken(payload: any) {
    if (payload.hasOwnProperty('id_token')) {
      let email,
        firstName,
        lastName = '';

      //You can decode the id_token which returned from Apple,
      const decodedObj = await this.jwtService.decode(payload.id_token);
      const accountId = decodedObj.sub || '';
      console.info(`Apple Account ID: ${accountId}`);

      //Email address
      if (decodedObj.hasOwnProperty('email')) {
        email = decodedObj['email'];
        console.info(`Apple Email: ${email}`);
      }

      //You can also extract the firstName and lastName from the user, but they are only shown in the first time.
      if (payload.hasOwnProperty('user')) {
        const userData = JSON.parse(payload.user);
        const { firstName, lastName } = userData.name || {};
      }

      //.... you logic for registration and login here
    }
    throw new UnauthorizedException('Unauthorized');
  }
}
