import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { EmailService } from '../../email/email.service';
import { ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let userService: Partial<UserService>;
  let jwtService: Partial<JwtService>;
  let otpService: Partial<OtpService>;
  let emailService: Partial<EmailService>;

  beforeEach(async () => {
    userService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      updatePassword: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('test_jwt_token'),
    };

    otpService = {
      createOtp: jest.fn(),
      verifyOtp: jest.fn(),
    };

    emailService = {
      sendEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
        { provide: OtpService, useValue: otpService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new user successfully', async () => {
    (userService.findByEmail as jest.Mock).mockResolvedValue(null);
    (userService.create as jest.Mock).mockResolvedValue({
      id: 'user-uuid',
      email: 'kozin@gmail.com',
      name: 'Ko Zin',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (otpService.createOtp as jest.Mock).mockResolvedValue({ code: '123456' });
    // (emailService.sendEmail as jest.Mock).mockResolvedValue({ messageId: 'msgid' });

    const result = await service.registerUser({
      name: 'Ko Zin',
      email: 'kozin@gmail.com',
      password: 'password123',
    });

    expect(userService.findByEmail).toHaveBeenCalledWith('kozin@gmail.com');
    expect(userService.create).toHaveBeenCalled();
    expect(otpService.createOtp).toHaveBeenCalledWith('user-uuid', 'SIGNUP');
    // expect(emailService.sendEmail).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'User registered successfully. Please verify your email with the OTP sent.',
    });
  });

  it('should throw ConflictException if email already exists', async () => {
    (userService.findByEmail as jest.Mock).mockResolvedValue({
      id: 'existing-user-id',
      email: 'kozin@gmail.com',
    });

    await expect(
      service.registerUser({
        name: 'Ko Zin',
        email: 'kozin@gmail.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  // Additional tests for verifyEmail, login, verifyLoginOtp, forgotPassword, resetPassword...
});
