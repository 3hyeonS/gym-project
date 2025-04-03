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
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { RefreshTokenEntity } from './entity/refreshToken.entity';
import { addressResponseDto } from './dto/address-response.dto';
import { GymEntity } from 'src/gyms/entity/gyms.entity';
import { ExpiredGymEntity } from 'src/gyms/entity/expiredGyms.entity';
import { EmailService } from './email.service';
import { EmailCodeEntity } from './entity/emailCode.entity';
import { CenterModifyRequestDto } from './dto/center-modify-request.dto';
import { Gym2Entity } from 'src/gyms/entity/gyms2.entity';
import appleSignin from 'apple-signin-auth';
import { SignWithEntity } from './entity/signWith.entity';
import { AuthorityEntity } from './entity/authority.entity';

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
    @InjectRepository(SignWithEntity)
    private signWithRepository: Repository<SignWithEntity>,
    @InjectRepository(AuthorityEntity)
    private authorityRepository: Repository<AuthorityEntity>,
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
    member: CenterEntity,
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
        ...centerModifyRequestDto,
        password: hashedPassword, // DTO의 password를 덮어쓰기
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

  // 관리자 회원 가입
  async adminSignUp(
    userSignUpRequestDto: UserSignUpRequestDto,
  ): Promise<UserEntity> {
    const { nickname, email } = userSignUpRequestDto;

    const kakao = await this.signWithRepository.findOne({
      where: { platform: 'LOCAL' },
    });

    const admin = await this.authorityRepository.findOne({
      where: { role: 'ADMIN' },
    });

    const newAdmin = this.userRepository.create({
      nickname,
      email,
      signWith: kakao,
      authority: admin,
    });

    const savedAdmin = await this.userRepository.save(newAdmin);
    return savedAdmin;
  }

  // 센터 회원 가입
  async centerSignUp(
    centerSignUpRequestDto: CenterSignUpRequestDto,
  ): Promise<CenterEntity> {
    const {
      signId,
      password,
      centerName,
      ceoName,
      businessId,
      phone,
      email,
      address,
    } = centerSignUpRequestDto;

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    const center = await this.authorityRepository.findOne({
      where: { role: 'CENTER' },
    });

    const newCenter = this.centerRepository.create({
      signId,
      password: hashedPassword, // 해싱된 비밀번호 사용
      centerName,
      ceoName,
      businessId,
      phone,
      email,
      address,
      authority: center,
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
    const existingCenter = await this.findMemberBySignId(signId);
    if (existingCenter) {
      throw new ConflictException('signId already exists');
    }
  }

  // signId로 센터 찾기 메서드
  async findMemberBySignId(signId: string): Promise<CenterEntity> {
    const center: CenterEntity = await this.centerRepository.findOne({
      where: { signId },
    });
    return center;
  }

  // 이메일 중복 확인 메서드
  async checkEmailExists(email: string): Promise<void> {
    const existingCenter = await this.findMemberByEmail(email);
    if (existingCenter) {
      throw new ConflictException('email already exists');
    }
  }

  // 이메일로 센터 찾기 메서드
  private async findMemberByEmail(email: string): Promise<CenterEntity> {
    const center: CenterEntity = await this.centerRepository.findOne({
      where: { email },
    });
    return center;
  }

  // 비밀번호 해싱 암호화 메서드
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(); // 솔트 생성
    return await bcrypt.hash(password, salt); // 비밀번호 해싱
  }

  // 카카오 정보 회원 가입
  async signUpWithKakao(
    profile: any,
    kakaoUserId: number,
  ): Promise<UserEntity> {
    const kakaoAccount = profile.kakao_account;

    const kakaoUserNickname = kakaoAccount.profile.nickname;
    const kakaoEmail = kakaoAccount.email;
    const kakaoStringId = kakaoUserId.toString();

    // 카카오 프로필 데이터를 기반으로 사용자 찾기 또는 생성 로직을 구현
    const existingUser = await this.userRepository.findOne({
      where: { signWith: 'KAKAO', signId: kakaoStringId },
    });
    if (existingUser) {
      return existingUser;
    }

    // password 필드에 랜덤 문자열 생성
    const temporaryPassword = uuidv4(); // 랜덤 문자열 생성
    const hashedPassword = await this.hashPassword(temporaryPassword);

    // 새 사용자 생성 로직
    const newUser = this.userRepository.create({
      signId: kakaoStringId,
      nickname: kakaoUserNickname,
      email: kakaoEmail,
      password: hashedPassword, // 해싱된 임시 비밀번호 사용
      signWith: 'KAKAO',
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

      // Access Token으로 Kakao 사용자 정보, 회원번호 요청
      const kakaoUserInfo = await this.getKakaoUserInfo(kakaoAccessToken);
      const kakaoUserId = await this.getKakaoUserId(kakaoAccessToken);

      // 카카오 사용자 정보를 기반으로 회원가입 또는 로그인 처리
      const user = await this.signUpWithKakao(kakaoUserInfo, kakaoUserId);

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

  // Kakao Access Token 으로 Kakao 회원 번호 요청
  async getKakaoUserId(accessToken: string): Promise<number> {
    const tokenInfoUrl = 'https://kapi.kakao.com/v1/user/access_token_info';
    const response = await firstValueFrom(
      this.httpService.get(tokenInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    return response.data.id;
  }

  // accessToken 생성 공통 메서드
  async generateAccessToken(
    member: UserEntity | CenterEntity,
  ): Promise<string> {
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

  // 앱 어드민 키, Kakao 회원번호로 Kakao 연결 끊기
  async unlinkKakao(signId: string): Promise<void> {
    const unlinkUrl = 'https://kapi.kakao.com/v1/user/unlink';
    const payload = {
      target_id_type: 'user_id',
      target_id: Number(signId),
    };
    const response = await firstValueFrom(
      this.httpService.post(unlinkUrl, null, {
        params: payload,
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }),
    );
    console.log(response.data);
  }

  // 회원 탈퇴 기능
  async deleteUser(member: UserEntity | CenterEntity): Promise<void> {
    const signId = member.signId;
    //해당 signId의 모든 refreshToken 삭제
    await this.revokeRefreshTokenBySignId(signId);

    // 탈퇴 처리
    if (member instanceof UserEntity) {
      if (member.signWith == 'KAKAO') {
        await this.unlinkKakao(member.signId);
      }
      if (member.signWith == 'APPLE') {
        await this.revokeAppleTokens(member.password);
      }
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

  // apple 로그인
  async signInWithApple(
    payload: any,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    try {
      const { sub: userAppleId } = await appleSignin.verifyIdToken(
        payload.id_token,
      );

      const clientSecret = appleSignin.getClientSecret({
        clientID: process.env.APPLE_CLIENT_ID, // Apple Client ID
        teamID: process.env.APPLE_TEAM_ID, // Apple Developer Team ID.
        privateKeyPath: process.env.APPLE_KEYFILE_PATH, // private key associated with your client ID. -- Or provide a `privateKeyPath` property instead.
        keyIdentifier: process.env.APPLE_KEY_ID, // identifier of the private key.
        // OPTIONAL
        expAfter: 15777000, // Unix time in seconds after which to expire the clientSecret JWT. Default is now+5 minutes.
      });

      const options = {
        clientID: process.env.APPLE_CLIENT_ID, // Apple Client ID
        redirectUri: process.env.APPLE_CALLBACK_URL, // use the same value which you passed to authorisation URL.
        clientSecret: clientSecret,
      };

      let user: UserEntity;

      if (payload.hasOwnProperty('user')) {
        const userData = JSON.parse(payload.user);
        const email = userData.email || '';
        const firstName = userData.name?.firstName || '';
        const lastName = userData.name?.lastName || '';
        const name = lastName + firstName;

        // 애플 사용자 정보를 기반으로 회원가입 처리
        const { refresh_token: appleRefreshToken } =
          await appleSignin.getAuthorizationToken(payload.code, options);
        user = await this.signUpWithApple(
          userAppleId,
          appleRefreshToken,
          email,
          name,
        );
      } else {
        // 기존 애플 사용자 정보 불러오기
        user = await this.userRepository.findOne({
          where: { signId: userAppleId },
        });
      }

      // [1] JWT 토큰 생성 (Secret + Payload)
      const accessToken = await this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user);
      // [2] 사용자 정보 반환
      return { accessToken, refreshToken, user };
    } catch (err) {
      // Token is not verified
      throw new UnauthorizedException('ID_Token is invalid');
    }
  }

  // 애플 정보 기반 회원가입 또는 로그인 처리
  async signUpWithApple(
    userAppleId: string,
    appleRefreshToken: string,
    email: string,
    name: string,
  ): Promise<UserEntity> {
    // 새 사용자 생성 로직
    const newUser = this.userRepository.create({
      signId: userAppleId, // apple 계정별 고유 아이디
      nickname: name,
      email: email,
      password: appleRefreshToken, // apple refresh token 사용
      signWith: 'APPLE',
      // 기타 필요한 필드 설정
      role: 'USER',
    });

    return await this.userRepository.save(newUser);
  }

  async revokeAppleTokens(appleRefreshToken: string): Promise<void> {
    const clientSecret = appleSignin.getClientSecret({
      clientID: process.env.APPLE_CLIENT_ID, // Apple Client ID
      teamID: process.env.APPLE_TEAM_ID, // Apple Developer Team ID.
      privateKeyPath: process.env.APPLE_KEYFILE_PATH, // private key associated with your client ID. -- Or provide a `privateKeyPath` property instead.
      keyIdentifier: process.env.APPLE_KEY_ID, // identifier of the private key.
      // OPTIONAL
      expAfter: 15777000, // Unix time in seconds after which to expire the clientSecret JWT. Default is now+5 minutes.
    });

    const options = {
      clientID: process.env.APPLE_CLIENT_ID, // Apple Client ID
      clientSecret: clientSecret,
      tokenTypeHint: 'refresh_token' as 'refresh_token',
    };
    await appleSignin.revokeAuthorizationToken(appleRefreshToken, options);
  }
}
