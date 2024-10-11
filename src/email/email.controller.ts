import { Controller, Post, Body } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { SendEmailDto } from "./email.interface";
import { EmailService } from './email.service';
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
    constructor(private readonly emailService: EmailService) {}

    @Post('send')
    @ApiOperation({ summary: 'Send an email' })
    @ApiResponse({ status: 200, description: 'Email sent successfully.' })
    async sendEmail(@Body() sendEmailDto: SendEmailDto) {
        return await this.emailService.sendEmail(sendEmailDto);
    }
}
    // async sendMail() {
    //     const dto: SendEmailDto = {
    //         from: { name: 'Ko Zin', address: 'kozin@gmail.com'},
    //         recipients: [{ name: 'Yay The', address: 'yaythe@gmail.com'}],
    //         subject: 'Hello Hi',
    //         html: '<p>Hi YayThe, How are you?</p>',

//         };
//         return await this.emailService.sendMail(dto);
//     }
// }