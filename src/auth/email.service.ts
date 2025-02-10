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
        user: 'officefit19@gmail.com',
        pass: 'kxnc mrik awsl ovgp',
      },
      // tls: {
      //   rejectUnauthorized: false, // SSL 인증서 검증 무시
      // },
    });
  }

  async sendVerificationToEmail(email: string, code: string): Promise<void> {
    const emailOptions: EmailOptions = {
      from: 'officefit19@gmail.com', // 보내는 사람 이메일 주소
      to: email, // 받는 사람의 이메일 주소
      subject: '가입 인증 메일',
      html: `<h1> 아래의 입력코드를 입력하세요.</h1><br/>${code}`,
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
