// firebase.service.ts
import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  constructor() {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
      authUri: process.env.FIREBASE_AUTH_URI,
      tokenUri: process.env.FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      clientC509CertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
      universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    };
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  async sendPushToDevice(
    token: string,
    title: string,
    body: string,
    screen: string,
  ) {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        screen,
      },
    };

    try {
      await admin.messaging().send(message);
    } catch (error) {
      console.error('FCM 전송 실패:', error);
    }
  }
}
