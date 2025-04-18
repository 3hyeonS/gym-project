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
import { LessThan, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom, retry } from 'rxjs';
import { CenterEntity } from './entity/center.entity';
import { CenterSignUpRequestDto } from './dto/center-dto/request-dto/center-sign-up-request-dto';
import { CenterSignInRequestDto } from './dto/center-dto/request-dto/center-sign-in-request-dto';
import { RefreshTokenEntity } from './entity/refreshToken.entity';
import { addressResponseDto } from './dto/center-dto/response-dto/address-response-dto';
import { EmailService } from './email.service';
import { EmailCodeEntity } from './entity/emailCode.entity';
import { CenterModifyRequestDto } from './dto/center-dto/request-dto/center-modify-request-dto';
import appleSignin from 'apple-signin-auth';
import { SignWithEntity } from './entity/user/signWith.entity';
import { AuthorityEntity } from './entity/authority.entity';
import { KakaoKeyEntity } from './entity/user/kakaoKey.entity';
import { AppleKeyEntity } from './entity/user/appleKey.entity';
import { AdminSignInRequestDto } from './dto/user-dto/request-dto/admin-sign-in-request-dto';
import { ResumeRegisterRequestDto } from './dto/resume-dto/request-dto/resume-register-request-dto';
import { ResumeResponseDto } from './dto/resume-dto/response-dto/resume-response-dto';
import { CareerEntity } from './entity/resume/career.entity';
import { AcademyEntity } from './entity/resume/academy.entity';
import { QualificationEntity } from './entity/resume/qualification.entity';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { RecruitmentService } from 'src/recruitment/recruitment.service';
import { RecruitmentEntity } from 'src/recruitment/entity/recruitment.entity';
import { PersonalModifyRequestDto } from './dto/resume-dto/request-dto/personal-modify-request-dto';
import { WorkConditionModifyRequestDto } from './dto/resume-dto/request-dto/work-condition-modify-request-dto';
import { AdditionalModifyRequestDto } from './dto/resume-dto/request-dto/additional-modify-request-dto';
import { IntroductionModifyRequestDto } from './dto/resume-dto/request-dto/introduction-modify-request-dto';
import { AwardModifyRequestDto } from './dto/resume-dto/request-dto/award-modify-request-dto';
import { ProfileImageModifyRequestDto } from './dto/resume-dto/request-dto/profileImage-modify-request-dto';
import { UserEntity } from './entity/user/user.entity';
import { ResumeEntity } from './entity/resume/resume.entity';
import { AdminSignUpRequestDto } from './dto/user-dto/request-dto/user-sign-up-request-dto';
import { CareerModifyRequestDto } from './dto/resume-dto/career-dto/career-modify-request-dto';
import { QualificationModifyRequestDto } from './dto/resume-dto/qualification-dto/qualification-modify-request-dto';
import { AcademyModifyRequestDto } from './dto/resume-dto/academy-dto/academy-modify-request-dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private s3: S3Client;
  private bucketName: string;

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CenterEntity)
    private centerRepository: Repository<CenterEntity>,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailCodeEntity)
    private emailCodeRepository: Repository<EmailCodeEntity>,
    @InjectRepository(SignWithEntity)
    private signWithRepository: Repository<SignWithEntity>,
    @InjectRepository(AuthorityEntity)
    private authorityRepository: Repository<AuthorityEntity>,
    @InjectRepository(KakaoKeyEntity)
    private kakaoKeyRepository: Repository<KakaoKeyEntity>,
    @InjectRepository(AppleKeyEntity)
    private appleKeyRepository: Repository<AppleKeyEntity>,
    @InjectRepository(ResumeEntity)
    private resumeRepository: Repository<ResumeEntity>,
    @InjectRepository(CareerEntity)
    private careerRepository: Repository<CareerEntity>,
    @InjectRepository(AcademyEntity)
    private academyRepository: Repository<AcademyEntity>,
    @InjectRepository(QualificationEntity)
    private qualificationRepository: Repository<QualificationEntity>,
    @InjectRepository(RecruitmentEntity)
    private recruitmentRepository: Repository<RecruitmentEntity>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private emailService: EmailService,
    private recruitmentService: RecruitmentService,
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  // 문자 출력
  getHello(): string {
    return 'Welcome Autorization';
  }

  // 이메일 인증 코드 전송
  async sendVerificationCode(email: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.emailService.sendVerificationToEmail(email, code);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3); // 3분 뒤 만료
    await this.emailCodeRepository.delete({ email });
    await this.emailCodeRepository.save({
      email,
      code,
      expiresAt,
    });
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

    await this.emailCodeRepository.remove(savedCode);
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

    await this.emailCodeRepository.save({
      email,
      code,
      expiresAt,
    });
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
    const existingCenter = await this.centerRepository.findOne({
      where: {
        email: centerModifyRequestDto.email,
        id: Not(center.id), //
      },
    });
    if (existingCenter) {
      throw new ConflictException('email already exists');
    }
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

    // // 채용공고의 주소 정보도 바꾸기
    // if (center.recruitment) {
    //   if (centerModifyRequestDto.address) {
    //     const hiringRecruitment = await this.recruitmentRepository.findOneBy({
    //       center,
    //     });
    //     if (hiringRecruitment) {
    //       const seperatedAddress = await this.recruitmentService.extractLocation(
    //         centerModifyRequestDto.address,
    //       );
    //       hiringRecruitment.city = seperatedAddress.city;
    //       hiringRecruitment.location = seperatedAddress.location;
    //       hiringRecruitment.address = centerModifyRequestDto.address;

    //       await this.recruitmentRepository.save(hiringRecruitment);
    //     }
    //   }
    // }

    const modifiedCenter = await this.centerRepository.findOneBy({ id });
    return modifiedCenter;
  }

  // 관리자 회원 가입
  async adminSignUp(
    adminSignUpRequestDto: AdminSignUpRequestDto,
  ): Promise<UserEntity> {
    const { adminId, email } = adminSignUpRequestDto;

    const local = await this.signWithRepository.findOneBy({
      platform: 'LOCAL',
    });

    const admin = await this.authorityRepository.findOneBy({ role: 'ADMIN' });

    return await this.userRepository.save({
      nickname: adminId,
      email,
      signWith: local,
      authority: admin,
    });
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

    // signId 중복체크
    await this.checkSignIdExists(signId);

    // 이메일 중복체크
    await this.checkEmailExists(email);

    // 사업자등록번호 중복체크
    await this.checkBusinessIdExists(businessId);

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    const center = await this.authorityRepository.findOneBy({ role: 'CENTER' });

    return await this.centerRepository.save({
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
  }

  // 관리자 로그인 메서드
  async adminSignIn(adminSignInRequestDto: AdminSignInRequestDto): Promise<{
    accessToken: string;
    refreshToken: string;
    admin: UserEntity;
  }> {
    const { adminId, email } = adminSignInRequestDto;

    const existingAdmin = await this.userRepository.findOneBy({
      nickname: adminId,
      email,
    });

    if (
      !existingAdmin ||
      existingAdmin.signWith.platform != 'LOCAL' ||
      existingAdmin.authority.role != 'ADMIN'
    ) {
      throw new UnauthorizedException('Incorrect adminId or email');
    }

    const accessToken = await this.generateAccessToken(existingAdmin);
    const refreshToken = await this.generateRefreshToken(existingAdmin);

    return { accessToken, refreshToken, admin: existingAdmin };
  }

  // 센터 로그인 메서드
  async centerSignIn(centerSignInRequestDto: CenterSignInRequestDto): Promise<{
    accessToken: string;
    refreshToken: string;
    center: CenterEntity;
  }> {
    const { signId, password } = centerSignInRequestDto;

    // [1] 회원 정보 조회
    const existingCenter = await this.centerRepository.findOneBy({ signId });

    if (
      !existingCenter ||
      !(await bcrypt.compare(password, existingCenter.password))
    ) {
      throw new UnauthorizedException('Incorrect signId or password');
    }

    // [2] 회원 유형 판별 및 토큰 생성
    const accessToken = await this.generateAccessToken(existingCenter);
    const refreshToken = await this.generateRefreshToken(existingCenter);

    // [3] 사용자 정보 반환
    return { accessToken, refreshToken, center: existingCenter };
  }

  // signId 중복 확인 메서드
  async checkSignIdExists(signId: string): Promise<void> {
    const existingCenter = await this.centerRepository.findOneBy({
      signId,
    });
    if (existingCenter) {
      throw new ConflictException('signId already exists');
    }
  }

  // 이메일 중복 확인 메서드
  async checkEmailExists(email: string): Promise<void> {
    const existingCenter = await this.centerRepository.findOneBy({
      email,
    });
    if (existingCenter) {
      throw new ConflictException('email already exists');
    }
  }

  // 비밀번호 해싱 암호화 메서드
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(); // 솔트 생성
    return await bcrypt.hash(password, salt); // 비밀번호 해싱
  }

  // 카카오 정보 회원 가입
  async signUpWithKakao(
    profile: any,
    kakaoUserId: string,
  ): Promise<UserEntity> {
    const kakaoAccount = profile.kakao_account;

    const kakaoUserNickname = kakaoAccount.profile.nickname;
    const kakaoEmail = kakaoAccount.email;

    // 카카오 프로필 데이터를 기반으로 사용자 찾기 또는 생성 로직을 구현
    const existingUser = await this.userRepository.findOne({
      where: {
        email: kakaoEmail,
        signWith: { platform: 'KAKAO' },
      },
    });
    if (existingUser?.kakaoKey?.kakaoId === kakaoUserId) {
      return existingUser;
    }

    // 새 사용자 생성 로직
    const newUser = await this.userRepository.save({
      nickname: kakaoUserNickname,
      email: kakaoEmail,
      signWith: await this.signWithRepository.findOneBy({ platform: 'KAKAO' }),
      authority: await this.authorityRepository.findOneBy({ role: 'USER' }),
    });

    await this.kakaoKeyRepository.save({
      kakaoId: kakaoUserId,
      user: newUser,
    });

    return await this.userRepository.findOneBy({ id: newUser.id });
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
  async getKakaoUserId(accessToken: string): Promise<string> {
    const tokenInfoUrl = 'https://kapi.kakao.com/v1/user/access_token_info';
    const response = await firstValueFrom(
      this.httpService.get(tokenInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    return response.data.id.toString();
  }

  // accessToken 생성 공통 메서드
  async generateAccessToken(
    member: UserEntity | CenterEntity,
  ): Promise<string> {
    // [1] JWT 토큰 생성 (Secret + Payload)
    const payload = {
      id: member.id,
      email: member.email,
      role: member.authority.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_SECRET,
      expiresIn: process.env.ACCESS_EXPIRATION,
    });
    return accessToken;
  }

  // Refresh Token 생성 및 저장
  async generateRefreshToken(
    member: UserEntity | CenterEntity,
  ): Promise<string> {
    const payload = {
      id: member.id,
      email: member.email,
      role: member.authority.role,
    };
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRATION,
    }); // Refresh Token 생성
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 만료
    // expiresAt.setMinutes(expiresAt.getMinutes() + 3);

    await this.refreshTokenRepository.save({
      token: refreshToken,
      expiresAt,
      user: member instanceof UserEntity ? member : null,
      center: member instanceof CenterEntity ? member : null,
    });
    return refreshToken;
  }

  // Refresh Token 검증
  async validateRefreshToken(
    refreshToken: string,
  ): Promise<UserEntity | CenterEntity> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refreshToken');
    }

    return tokenEntity.user || tokenEntity.center;
  }

  // 해당 refresh Token 삭제 (로그아웃 시)
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenEntity = await this.refreshTokenRepository.findOneBy({
      token: refreshToken,
    });
    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refreshToken');
    } else {
      await this.refreshTokenRepository.remove(tokenEntity);
    }
  }

  // 해당 아이디의 모든 refresh token 삭제 (회원 탈퇴 시)
  async revokeRefreshTokenBySignId(
    member: UserEntity | CenterEntity,
  ): Promise<void> {
    if (member instanceof UserEntity) {
      await this.refreshTokenRepository.delete({
        user: { id: member.id },
      });
    } else {
      await this.refreshTokenRepository.delete({
        center: { id: member.id },
      });
    }
  }

  // 만료된 refresh token 삭제
  async removeExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepository.delete({ expiresAt: LessThan(now) });
  }

  // Access Token 갱신
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    member: UserEntity | CenterEntity;
  }> {
    const member = await this.validateRefreshToken(refreshToken);

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
  async unlinkKakao(kakaoId: number): Promise<void> {
    const unlinkUrl = 'https://kapi.kakao.com/v1/user/unlink';
    const payload = {
      target_id_type: 'user_id',
      target_id: kakaoId,
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
    //해당 signId의 모든 refreshToken 삭제
    await this.revokeRefreshTokenBySignId(member);

    // 탈퇴 처리
    if (member instanceof UserEntity) {
      if (member.signWith.platform == 'KAKAO') {
        await this.unlinkKakao(Number(member.kakaoKey.kakaoId));
      }
      if (member.signWith.platform == 'APPLE') {
        await this.revokeAppleTokens(member.appleKey.appleRefreshToken);
      }
      // 이력서 삭제 및 s3 파일, 이미지 삭제
      const resume = await this.resumeRepository.findOne({
        where: {
          user: { id: member.id },
        },
      });
      if (resume) {
        await this.deleteResume(member);
      }
      await this.userRepository.remove(member);
    } else {
      // 공고 삭제 및 s3 파일, 이미지 삭제
      const recruitments = await this.recruitmentRepository.find({
        where: {
          center: { id: member.id }, // 명시적으로 id 사용
        },
      });
      for (let i = 0; i < recruitments.length; i++) {
        await this.recruitmentService.deleteRecruitment(
          member,
          recruitments[i].id,
        );
      }
      await this.centerRepository.remove(member);
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
      const { sub: appleId } = await appleSignin.verifyIdToken(
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
          name,
          email,
          appleId,
          appleRefreshToken,
        );
      } else {
        // 기존 애플 사용자 정보 불러오기
        const appleKey = await this.appleKeyRepository.findOneBy({ appleId });
        user = await this.userRepository.findOne({
          where: {
            appleKey: { id: appleKey.id },
          },
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
    name: string,
    email: string,
    appleId: string,
    appleRefreshToken: string,
  ): Promise<UserEntity> {
    // 새 사용자 생성 로직
    const newUser = await this.userRepository.save({
      nickname: name,
      email: email,
      signWith: await this.signWithRepository.findOneBy({ platform: 'APPLE' }),
      authority: await this.authorityRepository.findOneBy({ role: 'USER' }),
    });

    await this.appleKeyRepository.save({
      appleId,
      appleRefreshToken,
      user: newUser,
    });

    return await this.userRepository.findOneBy({ id: newUser.id });
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

  // 이력서 보유 여부 확인
  async hasResume(user: UserEntity): Promise<boolean> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id }, // 명시적으로 id 사용
      },
    });
    if (myResume) {
      return true;
    }
    return false;
  }

  // 내 이력서 불러오기
  async getMyResume(user: UserEntity): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id }, // 명시적으로 id 사용
      },
    });
    if (!myResume) {
      throw new NotFoundException('There is no registered resume');
    }
    return new ResumeResponseDto(myResume);
  }

  // 증명사진 S3 업로드
  async uploadProfileImage(
    user: UserEntity,
    file: Express.Multer.File,
  ): Promise<string> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id }, // 명시적으로 id 사용
      },
    });

    // 증명사진이 기존에 있으면 번호 증가 후 삭제
    let number = 0;
    if (myResume) {
      const match = myResume.profileImage.match(/profileImage(\d+)/);
      const urlNumber = parseInt(match[1], 10);
      number = urlNumber + 1;

      const fileKey = myResume.profileImage.split('com/')[1];
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
      };
      await this.s3.send(new DeleteObjectCommand(params));
    }

    const newFileKey = `resume/${user.id}/profileImage${number}`;

    // 업로드
    const params = {
      Bucket: this.bucketName,
      Key: newFileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(params));
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${newFileKey}`;
  }

  // 포트폴리오 파일 S3 업로드
  async uploadPortfolioFile(
    user: UserEntity,
    file: Express.Multer.File,
  ): Promise<string> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id }, // 명시적으로 id 사용
      },
    });

    // 포트폴리오 파일이 기존에 있으면 번호 증가 후 삭제
    let number = 0;
    if (myResume) {
      const match = myResume.portfolioFile.match(/file(\d+)/);
      const urlNumber = parseInt(match[1], 10);
      number = urlNumber + 1;

      const fileKey = myResume.portfolioFile.split('com/')[1];
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
      };
      await this.s3.send(new DeleteObjectCommand(params));
    }

    const newFileKey = `resume/${user.id}/portfolio/file${number}`;

    // 업로드
    const params = {
      Bucket: this.bucketName,
      Key: newFileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(params));
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${newFileKey}`;
  }

  // 포트폴리오 다중 이미지 S3 업로드
  async uploadPortfolioImages(
    user: UserEntity,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id }, // 명시적으로 id 사용
      },
    });

    // 이미 등록된 이미지가 있으면 시작 번호 증가
    let number = 0;
    if (myResume) {
      if (myResume.portfolioImages) {
        for (const url of myResume.portfolioImages) {
          const match = url.match(/image(\d+)/);
          const urlNumber = parseInt(match[1], 10);
          number = urlNumber > number ? urlNumber : number;
        }
        number = number + 1;
      }
    }

    if (!files || files.length === 0) {
      return [];
    }
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileKey = `resume/${user.id}/portfolio/images/image${i + number}`;

      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await this.s3.send(new PutObjectCommand(params));
      uploadedUrls.push(
        `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      );
    }

    return uploadedUrls;
  }

  // 이력서 등록
  async registerResume(
    user: UserEntity,
    resumeRegisterRequestDto: ResumeRegisterRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id }, // 명시적으로 id 사용
      },
    });
    if (myResume) {
      throw new ConflictException('Your resume already exists');
    }
    const toNullableArray = (arr?: string[]) =>
      !arr || arr.length === 0 ? null : arr;

    const toNullableString = (value?: string): string | null =>
      !value || value.trim() === '' ? null : value;

    const newResume = await this.resumeRepository.save({
      profileImage: resumeRegisterRequestDto.profileImage,
      name: resumeRegisterRequestDto.name,
      birth: resumeRegisterRequestDto.birth,
      phone: resumeRegisterRequestDto.phone,
      email: resumeRegisterRequestDto.email,
      gender: resumeRegisterRequestDto.gender,
      location: resumeRegisterRequestDto.location,
      isNew: resumeRegisterRequestDto.isNew,
      workType: toNullableArray(resumeRegisterRequestDto.workType),
      workTime: toNullableArray(resumeRegisterRequestDto.workTime),
      license: 0,
      award: toNullableArray(resumeRegisterRequestDto.award),
      SNS: toNullableString(resumeRegisterRequestDto.SNS),
      portfolioFile: toNullableString(resumeRegisterRequestDto.portfolioFile),
      portfolioImages: toNullableArray(
        resumeRegisterRequestDto.portfolioImages,
      ),
      introduction: toNullableString(resumeRegisterRequestDto.introduction),
      user,
    });

    for (const career of resumeRegisterRequestDto.careers ?? []) {
      await this.careerRepository.save({
        ...career,
        resume: newResume,
      });
    }

    if (resumeRegisterRequestDto.academy) {
      await this.academyRepository.save({
        ...resumeRegisterRequestDto.academy,
        resume: newResume,
      });
    }

    for (const qualifiaction of resumeRegisterRequestDto.qualifications ?? []) {
      if (qualifiaction.certificate == '생활체육지도자') {
        newResume.license = 1;
      }
      await this.qualificationRepository.save({
        ...qualifiaction,
        resume: newResume,
      });
    }

    const savedResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id }, // 명시적으로 id 사용
      },
    });
    return new ResumeResponseDto(savedResume);
  }

  // 이력서 삭제
  async deleteResume(user: UserEntity): Promise<void> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id }, // 명시적으로 id 사용
      },
    });
    if (!myResume) {
      throw new NotFoundException('There is no registered resume');
    }

    // 증명사진 삭제
    const fileKey = myResume.profileImage.split('com/')[1];
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };
    await this.s3.send(new DeleteObjectCommand(params));

    // 포트폴리오 파일 삭제
    if (myResume.portfolioFile) {
      const fileKey = myResume.portfolioFile.split('com/')[1];
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
      };
      await this.s3.send(new DeleteObjectCommand(params));
    }

    // 포트폴리오 이미지 삭제
    if (myResume.portfolioImages) {
      for (let i = 0; i < myResume.portfolioImages.length; i++) {
        const fileKey = myResume.portfolioImages[i].split('com/')[1];
        const params = {
          Bucket: this.bucketName,
          Key: fileKey,
        };
        await this.s3.send(new DeleteObjectCommand(params));
      }
    }
    await this.resumeRepository.remove(myResume);
  }

  // 이력서 증명사진 수정하기
  async modifyProfileImage(
    user: UserEntity,
    profileImageModifyRequestDto: ProfileImageModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }

    myResume.profileImage = profileImageModifyRequestDto.profileImage;

    const updatedResume = await this.resumeRepository.save(myResume);
    return new ResumeResponseDto(updatedResume);
  }

  // 이력서 개인정보 수정하기
  async modifyPersonal(
    user: UserEntity,
    personalModifyRequestDto: PersonalModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }

    myResume.name = personalModifyRequestDto.name;
    myResume.birth = personalModifyRequestDto.birth;
    myResume.phone = personalModifyRequestDto.phone;
    myResume.email = personalModifyRequestDto.email;
    myResume.gender = personalModifyRequestDto.gender;

    const updatedResume = await this.resumeRepository.save(myResume);
    return new ResumeResponseDto(updatedResume);
  }

  // 이력서 희망근무조건 수정하기
  async modifyWorkCondition(
    user: UserEntity,
    workConditionModifyRequestDto: WorkConditionModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }

    const toNullableArray = (arr?: string[]) =>
      !arr || arr.length === 0 ? null : arr;

    myResume.location = workConditionModifyRequestDto.location;
    myResume.workType = toNullableArray(workConditionModifyRequestDto.workType);
    myResume.workTime = toNullableArray(workConditionModifyRequestDto.workTime);

    const updatedResume = await this.resumeRepository.save(myResume);
    return new ResumeResponseDto(updatedResume);
  }

  // 이력서 경력정보 수정하기
  async modifyCareer(
    user: UserEntity,
    careerModifyRequestDto: CareerModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }

    myResume.isNew = careerModifyRequestDto.isNew;
    await this.resumeRepository.save(myResume);

    // careers 초기화 후 재등록
    await this.careerRepository.delete({ resume: { id: myResume.id } }); // 기존 삭제
    if (careerModifyRequestDto.careers) {
      const newCareers = careerModifyRequestDto.careers.map((career) =>
        this.careerRepository.create({
          ...career,
          resume: myResume,
        }),
      );
      await this.careerRepository.save(newCareers);
    }

    const updatedResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });

    return new ResumeResponseDto(updatedResume);
  }

  // 이력서 학력정보 수정하기
  async modifyAcademy(
    user: UserEntity,
    academyModifyRequestDto: AcademyModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }
    // academy 초기화 후 재등록
    await this.academyRepository.delete({ resume: { id: myResume.id } });
    if (academyModifyRequestDto.academy) {
      await this.academyRepository.save({
        ...academyModifyRequestDto.academy,
        resume: myResume,
      });
    }

    const updatedResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    return new ResumeResponseDto(updatedResume);
  }

  // 이력서 자격증정보 수정하기
  async modifyQualification(
    user: UserEntity,
    qualificationModifyRequestDto: QualificationModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }

    // qualifications 초기화 후 재등록
    await this.qualificationRepository.delete({ resume: { id: myResume.id } });
    if (qualificationModifyRequestDto.qualifications) {
      const newQualifications =
        qualificationModifyRequestDto.qualifications.map((qualifiaction) =>
          this.qualificationRepository.create({
            ...qualifiaction,
            resume: myResume,
          }),
        );
      await this.qualificationRepository.save(newQualifications);

      // 4-1. 생활스포츠지도사 있는지 체크
      const hasLicense = qualificationModifyRequestDto.qualifications.some(
        (qualifiaction) => qualifiaction.certificate === '생활스포츠지도사',
      );
      const modifiedResume = await this.resumeRepository.findOne({
        where: {
          user: { id: user.id },
        },
      });
      modifiedResume.license = hasLicense ? 1 : 0;
      await this.resumeRepository.save(modifiedResume);
    }

    const updatedResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    return new ResumeResponseDto(updatedResume);
  }

  // 이력서 수상정보 수정하기
  async modifyAward(
    user: UserEntity,
    awardModifyRequestDto: AwardModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }

    myResume.award = awardModifyRequestDto.award;

    const updatedResume = await this.resumeRepository.save(myResume);
    return new ResumeResponseDto(updatedResume);
  }

  // 이력서 추가정보 수정하기
  async modifyAdditional(
    user: UserEntity,
    additionalModifyRequestDto: AdditionalModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }

    const toNullableArray = (arr?: string[]) =>
      !arr || arr.length === 0 ? null : arr;

    const toNullableString = (value?: string): string | null =>
      !value || value.trim() === '' ? null : value;

    const toNullablePortfolioFile = toNullableString(
      additionalModifyRequestDto.portfolioFile,
    );

    const toNullablePortfolioImages = toNullableArray(
      additionalModifyRequestDto.portfolioImages,
    );

    // 포트폴리오 파일이 비어 있으면 s3에서 삭제
    if (myResume.portfolioFile) {
      if (!toNullablePortfolioFile) {
        const fileKey = myResume.portfolioFile.split('com/')[1];
        const params = {
          Bucket: this.bucketName,
          Key: fileKey,
        };
        await this.s3.send(new DeleteObjectCommand(params));
      }
    }

    // 기존 포트폴리오 이미지 url 중 유지하지 않는 url s3에서 삭제
    if (myResume.portfolioImages) {
      if (toNullablePortfolioImages) {
        const newUrl = new Set(additionalModifyRequestDto.portfolioImages);
        for (const url of myResume.portfolioImages) {
          if (!newUrl.has(url)) {
            const fileKey = url.split('com/')[1];
            const params = {
              Bucket: this.bucketName,
              Key: fileKey,
            };
            await this.s3.send(new DeleteObjectCommand(params));
          }
        }
      } else {
        // null 이면 모두 s3에서 삭제
        for (const url of myResume.portfolioImages) {
          const fileKey = url.split('com/')[1];
          const params = {
            Bucket: this.bucketName,
            Key: fileKey,
          };
          await this.s3.send(new DeleteObjectCommand(params));
        }
      }
    }

    myResume.SNS = toNullableString(additionalModifyRequestDto.SNS);
    myResume.portfolioFile = toNullablePortfolioFile;
    myResume.portfolioImages = toNullablePortfolioImages;

    const updatedResume = await this.resumeRepository.save(myResume);
    return new ResumeResponseDto(updatedResume);
  }

  // 이력서 자기소개 수정하기
  async modifyIntroduction(
    user: UserEntity,
    introductionModifyRequestDto: IntroductionModifyRequestDto,
  ): Promise<ResumeResponseDto> {
    const myResume = await this.resumeRepository.findOne({
      where: {
        user: { id: user.id },
      },
    });
    if (!myResume) {
      throw new NotFoundException('You did not register your resume');
    }

    const toNullableString = (value?: string): string | null =>
      !value || value.trim() === '' ? null : value;

    myResume.introduction = toNullableString(
      introductionModifyRequestDto.introduction,
    );

    const updatedResume = await this.resumeRepository.save(myResume);
    return new ResumeResponseDto(updatedResume);
  }
}
