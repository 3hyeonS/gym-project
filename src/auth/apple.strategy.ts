import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { Strategy } from 'passport-apple';

// .env 파일 로드
dotenv.config();

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKeyString: `——BEGIN PRIVATE KEY——
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgW/8iU0CT467JY4AP
+6mkwnhgsE5NY/6q9T4YuJMW4EKgCgYIKoZIzj0DAQehRANCAAQhMFFv45d6kiVr
tF3RYFhmtmzKGsD4qbw0TqioKHCNgrhxpdrTkqy684t3Nc+8NkbMmLVjwN0wiZSo
7EkvhCO8
——END PRIVATE KEY——`,
      // process.env.APPLE_PRIVATE_KEY_STRING?.replace(/\\n/g, '\n'),
      callbackURL: process.env.APPLE_CALLBACK_URL,
      passReqToCallback: true,
    });
  }

  async validate(req, accessToken, refreshToken, idToken, profile) {
    return { req, accessToken, refreshToken, idToken, profile };
  }
}
