import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './email.interface';
import Mail from 'nodemailer/lib/mailer';


@Injectable()
export class EmailService {
    // private transporter: nodemailer.Transporter;
  
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
  
    // async sendEmail(to: string, subject: string, text: string, html?: string): Promise<nodemailer.SentMessageInfo> {
    //   const fromEmail = this.configService.get<string>('FROM_EMAIL');

    //   const mailOptions: nodemailer.SendMailOptions = {
    //     from: fromEmail,
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

    constructor(private readonly configService: ConfigService) {}

    mailTransport() {
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('EMAIL_HOST'),
        port: parseInt(this.configService.get<string>('EMAIL_PORT'), 10),
        secure: true,
        auth: {
          user: this.configService.get<string>('EMAIL_USER'),
          pass: this.configService.get<string>('EMAIL_PASS'),
        }
      });

      return transporter;
    }

    async sendEmail(dto: SendEmailDto) {
      const {from, recipients, subject, html} = dto;

      const transport = this.mailTransport();

      const options: nodemailer.SendMailOptions = {
        from: from ?? {
          name: this.configService.get<string>('APP_NAME'),
          address: this.configService.get<string>('FROM_EMAIL'),
        },
        to: recipients.map(recipients => `${recipients.name} <${recipients.address}>`).join(', '),
        subject,
        html,

      }

      try {
        const result = await transport.sendMail(options);

        return result;
      } catch (error) {
        console.log('Error sending email:', error);
        throw new InternalServerErrorException('Failed to send email');
      }
    }

  }