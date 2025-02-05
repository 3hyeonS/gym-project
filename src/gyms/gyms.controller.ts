import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GymsService } from './gyms.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GymResponseDto } from './dto/gym-response-dto';
import { SearchedGymDto } from './dto/searched-gym-dto';
import { ResponseMsg } from 'src/decorators/response-message-decorator';
import { ResponseTransformInterceptor } from 'src/interceptors/response-transform-interceptor';
import { ResponseDto } from '../response-dto';
import { GenericApiResponse } from 'src/decorators/generic-api-response-decorator';
import { PrimitiveApiResponse } from 'src/decorators/primitive-api-response-decorator';
import { SelectedOptionsDto } from './dto/selected-options-dto';
import { ErrorApiResponse } from 'src/decorators/error-api-response-decorator';
import { RegisterRequestDto } from './dto/gym-registration-dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/custom-role.guard';
import { Roles } from 'src/decorators/roles-decorator';
import { MemberRole } from 'src/auth/entity/member.entity';
import { GetUser } from 'src/decorators/get-user-decorator';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { GymModifyRequestDto } from './dto/gym-id-request-dto';
import { CenterResponseDto } from 'src/auth/dto/center-response.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('GymsList')
@UseInterceptors(ResponseTransformInterceptor)
@ApiExtraModels(ResponseDto)
@Controller('gyms')
export class GymsController {
  constructor(private readonly gymsService: GymsService) {}

  //문자 출력
  @ApiOperation({
    summary: 'Welcome Gyms 출력',
  })
  @PrimitiveApiResponse({
    status: 200,
    description: '문자 출력 성공',
    message: 'String printed successfully',
    type: 'string',
    example: 'Welcome Gyms',
  })
  @ResponseMsg('String printed successfully')
  @Get()
  getHello(): string {
    return this.gymsService.getHello();
  }

  // 모든 헬스장 불러오기
  @ApiOperation({
    summary: '모든 헬스장 불러오기',
  })
  @GenericApiResponse({
    status: 200,
    description: '모든 헬스장 불러오기 성공',
    message: 'All gyms returned successfully',
    model: GymResponseDto,
    isArray: true,
  })
  @ResponseMsg('All gyms returned successfully')
  @Get('getAll')
  async getAll(
    @Query('page') page: number = 1, // 기본값 1
    @Query('limit') limit: number = 20, // 기본값 20
  ) {
    const allGyms = await this.gymsService.getAll(page, limit);
    return allGyms;
  }

  // 선택 조건에 맞는 헬스장 불러오기
  @ApiOperation({
    summary: '조건에 맞는 헬스장 불러오기',
    description: 'body 조건 Schema 클릭해서 각 필드별로 확인',
  })
  @GenericApiResponse({
    status: 201,
    description: '해당 조건의 헬스장 불러오기 성공',
    message: 'Gyms with selected conditions returned successfully',
    model: SearchedGymDto,
    isArray: true,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message:
      'selectedMaxClassFee must be a number conforming to the specified constraints',
    error: 'BadRequestException',
  })
  // @ErrorApiResponse({
  //   status: 500,
  //   description:
  //     'Internal Server Error  \n500은 에러는 에러 내용과 함께 백엔드와 공유',
  //   message: 'Cannot convert undefined or null to object',
  //   error: 'TypeError',
  // })
  @ResponseMsg('Gyms with selected conditions returned successfully')
  @Post('selected')
  async searchSelected(
    @Body() selectedOptionsDto: SelectedOptionsDto,
    @Query('page') page: number = 1, // 기본값 1
    @Query('limit') limit: number = 20, // 기본값 20
  ) {
    const searchedGyms = await this.gymsService.searchSelected(
      selectedOptionsDto,
      page,
      limit,
    );
    return searchedGyms;
  }

  //센터 공고 등록하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '센터 공고 등록하기',
    description: 'body 조건 Schema 클릭해서 각 필드별로 확인',
  })
  @GenericApiResponse({
    status: 201,
    description: '센터 공고 등록 성공',
    message: 'Gym recruitment registered successfully',
    model: GymResponseDto,
  })
  @ErrorApiResponse({
    status: 400,
    description: 'Bad Request  \nbody 입력값의 필드 조건 및 JSON 형식 오류',
    message:
      'maxClassFee must be a number conforming to the specified constraints',
    error: 'BadRequestException',
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 등록 가능)',
    message: 'Forbidden resource',
    error: 'ForbiddenException',
  })
  @ResponseMsg('Gym recruitment registered successfully')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '헬스장 등록 정보 및 이미지 파일',
    schema: {
      type: 'object',
      properties: {
        registerRequestDto: {
          type: 'string',
          description: 'JSON 문자열로 변환된 DTO',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' }, // 여러 개의 파일 처리
        },
      },
    },
  })
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(MemberRole.CENTER)
  @UseInterceptors(FilesInterceptor('images', 10))
  @Post('register')
  async register(
    @GetUser() member: CenterEntity,
    @Body('stringDto') stringDto: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<GymResponseDto> {
    const registerRequestDto: RegisterRequestDto = JSON.parse(stringDto);
    const registeredGym = await this.gymsService.register(
      member,
      registerRequestDto,
      files,
    );
    const gymResponsDto = new GymResponseDto(registeredGym);
    return gymResponsDto;
  }

  // 내 공고 불러오기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 공고 불러오기',
  })
  @GenericApiResponse({
    status: 200,
    description: '내 공고 불러오기 성공',
    message: 'My gym recruitment returned successfully',
    model: GymResponseDto,
    isArray: true,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 불러오기 가능)',
    message: 'Forbidden resource',
    error: 'ForbiddenException',
  })
  @ResponseMsg('My gym recruitment returned successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(MemberRole.CENTER)
  @Get('getMyGym')
  async getMyGym(@GetUser() member: CenterEntity) {
    console.log(new CenterResponseDto(member));
    const myGym = await this.gymsService.getMyGym(member);
    return myGym;
  }

  // 내 공고 수정하기
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '내 공고 수정하기',
  })
  @GenericApiResponse({
    status: 200,
    description: '내 공고 수정하기 성공',
    message: 'My gym recruitment modified successfully',
    model: GymResponseDto,
    isArray: true,
  })
  @ErrorApiResponse({
    status: 401,
    description: '유효하지 않거나 기간이 만료된 acccessToken',
    message: 'Invalid or expired accessToken',
    error: 'UnauthorizedException',
  })
  @ErrorApiResponse({
    status: 403,
    description: '센터 회원이 아님 (센터 회원만 공고 수정하기 가능)',
    message: 'Forbidden resource',
    error: 'ForbiddenException',
  })
  @ResponseMsg('My gym recruitment modified successfully')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(MemberRole.CENTER)
  @UseInterceptors(FilesInterceptor('images', 10))
  @Post('modifyMyGym')
  async modifyMyGym(
    @GetUser() member: CenterEntity,
    @Body('stringDto') stringDto: string,
    @Body('existImageUrls') existImageUrls?: string | string[],
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const gymModifyRequestDto: GymModifyRequestDto = JSON.parse(stringDto);
    let parsedExistImageUrls;
    if (existImageUrls) {
      parsedExistImageUrls = Array.isArray(existImageUrls)
        ? existImageUrls
        : [existImageUrls];
    } else {
      parsedExistImageUrls = null;
    }
    const modifiedMyGym = await this.gymsService.modifyMyGym(
      member.centerName,
      gymModifyRequestDto.id,
      gymModifyRequestDto.modifyRequest,
      parsedExistImageUrls,
      files,
    );
    return modifiedMyGym;
  }
}
