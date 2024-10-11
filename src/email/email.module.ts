import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { MailerController } from './email.controller';

@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  controllers: [MailerController],
  exports: [EmailService],
})
export class EmailModule {}
