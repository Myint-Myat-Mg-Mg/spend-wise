import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
  
    // constructor(private configService: ConfigService) {
    //   this.transporter = nodemailer.createTransport({
    //     host: this.configService.get<string>('EMAIL_HOST'),
    //     port: this.configService.get<number>('EMAIL_PORT'),
    //     secure: this.configService.get<number>('EMAIL_PORT') === 465, // true for 465, false for other ports
    //     auth: {
    //       user: this.configService.get<string>('EMAIL_USER'),
    //       pass: this.configService.get<string>('EMAIL_PASS'),
    //     },
    //   });

    //   this.transporter.verify((error, success) => {
    //     if (error) {
    //       console.error('Error connecting to EMAIL server:', error);
    //     } else {
    //       console.log('EMAIL server is ready to take messages');
    //     }
    //   });
    // }
  
    // async sendEmail(to: string, subject: string, text: string, html?: string) {
    //   const mailOptions: nodemailer.SendMailOptions = {
    //     from: this.configService.get<string>('FROM_EMAIL'),
    //     to,
    //     subject,
    //     text,
    //     html,
    //   };
  
    //   try {
    //     const info = await this.transporter.sendMail(mailOptions);
    //     console.log('EMail sent:', info.messageId);
    //     return info;
    //   } catch (error) {
    //     console.error('Error sending email:', error);
    //     throw new InternalServerErrorException('Failed to send email');
    //   }
    // }
  }