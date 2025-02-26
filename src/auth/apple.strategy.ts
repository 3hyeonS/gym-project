import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { Strategy } from '@arendajaelu/nestjs-passport-apple';

// .env 파일 로드
dotenv.config();

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      key: process.env.APPLE_PRIVATE_KEY_STRING?.replace(/\\n/g, '\n'),
      callbackURL: process.env.APPLE_CALLBACK_URL,
    });
  }
}
