import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

// Email 인터페이스. 타입을 지정해줍니다.
interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter; // nodemailer에서 mail을 보내기 위한 것

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // TLS 전용 포트
      secure: false, // 연결 후 STARTTLS로 암호화
      auth: {
        user: 'oasisapp2025@gmail.com',
        pass: 'aeid oadt cmcf acdv',
      },
      // tls: {
      //   rejectUnauthorized: false, // SSL 인증서 검증 무시
      // },
    });
  }

  async sendVerificationToEmail(email: string, code: string): Promise<void> {
    const emailOptions: EmailOptions = {
      from: '"오아시스" <oasisapp2025@gmail.com>', // 보내는 사람 이메일 주소
      to: email, // 받는 사람의 이메일 주소
      subject: '가입 인증 메일',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #333;">oasis 인증 메일</h2>
          <p style="text-align: center; font-size: 16px; color: #555;">
            안녕하세요, oasis 인증 코드입니다.<br>
            아래 인증 코드를 입력하여 인증을 완료하세요.
          </p>
          <div style="text-align: center; padding: 15px; background: #007bff; color: #fff; font-size: 24px; font-weight: bold; border-radius: 5px;">
            ${code}
          </div>
          <p style="text-align: center; font-size: 14px; color: #777; margin-top: 15px;">
            본 메일은 자동 발송되었습니다.<br>
            문의가 필요하시면 <a href="mailto:oasisapp2025@gmail.com" style="color: #007bff; text-decoration: none;">oasisapp2025@gmail.com</a>으로 연락주세요.
          </p>
          <p style="text-align: center; font-size: 12px; color: #aaa;">
            ⓒ 2025 oasis. All rights reserved.
          </p>
        </div>
      `,
    };

    return await this.transporter.sendMail(emailOptions);
  }

  // async sendNewPasswordToEmail(
  //   email: string,
  //   newPassword: string,
  // ): Promise<void> {
  //   const emailOptions: EmailOptions = {
  //     from: 'officefit19@gmail.com', // 보내는 사람 이메일 주소
  //     to: email, // 회원가입한 사람의 받는 이메일 주소
  //     subject: '임시 비밀번호 발송 메일',
  //     html: `<h1> 임시 비밀번호 입니다..</h1><br/>${newPassword}`,
  //   };

  //   return await this.transporter.sendMail(emailOptions);
  // }
}
