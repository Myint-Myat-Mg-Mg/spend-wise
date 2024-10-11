import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { UserRegisterDto, UserLoginDto } from './dto/auth.dto';
import { OtpService } from 'src/otp/otp.service';
import { OtpPurpose } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { SendEmailDto } from 'src/email/email.interface';
import { promises } from 'dns';
import { retry } from 'rxjs';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class  AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly otpService: OtpService,
        private readonly emailService: EmailService,
        private readonly configService: ConfigService,
    ) {}

    async registerUser(dto: UserRegisterDto): Promise<{ message: string }> {
        const { email, password, name} = dto;


        const existingUser = await this.userService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user: User = await this.userService.create({
                email,
                password: hashedPassword,
                name,
            });

            const otp = await this.otpService.createOtp(user.id, OtpPurpose.SIGNUP);

            const sendEmailDto: SendEmailDto = {
                from: {
                    name: this.configService.get<string>('APP_NAME') || 'Spend-Wise',
                    address: this.configService.get<string>('FROM_EMAIL') || 'no-reply@spend-wise.com',
                },
                recipients: [{
                    name: user.name,
                    address: user.email,
                }],
                subject: 'Verify your email for Spend-Wise',
                html: `<p>Your OTP code is <strong>${otp.code}</strong>. It expires in 1 minute.</p>`,
            };
            await this.emailService.sendEmail(sendEmailDto);

            return { message: 'User registered successfully. Please verify your email with the OTP sent.'};  
        } catch (error){
            console.log('Error registering user:', error);
            throw new InternalServerErrorException('Failed to create user');
        }; 
    }

    async verifyEmail(email: string, code: string): Promise<{ message: string }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const isValid = await this.otpService.verifyOtp(user.id, OtpPurpose.SIGNUP, code);
        if (isValid) {
            return { message: 'Email Verified successfully.'};
        }
        throw new BadRequestException('Invalid OTP');
    }

    async login(userLoginDto: UserLoginDto): Promise<{ message: string }> {
        const { email, password } = userLoginDto;

        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const otp = await this.otpService.createOtp(user.id, OtpPurpose.LOGIN);
        
        const sendEmailDto: SendEmailDto = {
            from: {
                name: this.configService.get<string>('APP_NAME') || 'Spend-Wise',
                address: this.configService.get<string>('FROM_EMAIL') || 'no-reply@spend-wise.com',
            },
            recipients: [{
                name: user.name,
                address: user.email,
            }],
            subject: 'Verify your email for Spend-Wise',
            html: `<p>Your OTP code is <strong>${otp.code}</strong>. It expires in 1 minute.</p>`,
        };

        await this.emailService.sendEmail(sendEmailDto);

        return { message: 'OTP sent to your email. Please verify to complete login.'};
    }

    async verifyLoginOtp(email: string, code: string): Promise<{ access_token: string }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const isValid = await this.otpService.verifyOtp(user.id, OtpPurpose.LOGIN, code);
        if (isValid) {
            const payload = { username: user.email, sub: user.id };
            return {
                access_token: this.jwtService.sign(payload,{
                    secret:process.env.JWT_SECRET
                }),
            };
        }
        throw new BadRequestException('Invalid or expired OTP');
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User with this email does not exist');
        }

        const otp = await this.otpService.createOtp(user.id, OtpPurpose.FORGOT_PASSWORD);

        const sendEmailDto: SendEmailDto = {
            from: {
                name: this.configService.get<string>('APP_NAME') || 'Spend-Wise',
                address: this.configService.get<string>('FROM_EMAIL') || 'no-reply@spend-wise.com',
            },
            recipients: [{
                name: user.name,
                address: user.email,
            }],
            subject: 'Reset your password for Spend-Wise',
            html: `<p>Your OTP code is <strong>${otp.code}</strong>. It expires in 1 minute.</p>`,
        }
        await this.emailService.sendEmail(sendEmailDto);

        return { message: 'OTP sent to your email. Please verify to reset your password.'};
    }

    async resetPassword(userId: string, code: string, newPassword: string): Promise<{ message: string }> {
        const isValid = await this.otpService.verifyOtp(userId, OtpPurpose.FORGOT_PASSWORD, code);
        if (!isValid) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userService.updatePassword(userId, hashedPassword);
            return { message: 'Password reset successfully.'};
        }
        throw new BadRequestException('Invalid OTP');
    }
}
