import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as randomKey from 'random-key';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from '../dtos/login.dto';
import { RequestResetPasswordDto } from '../../user/dtos/request-reset-password.dto';
import { ResetPasswordDto } from '../../user/dtos/reset-password.dto';
import { UserService } from '../../user/services/user.service';
import { ConfigService } from '@nestjs/config';
import { EmailService, EmailOptions } from '../../email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRecoverPassword } from '../../user/entities/user-recover-password.entity';
import { Member } from '../../team/entities/member.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectRepository(UserRecoverPassword)
    private userRecoverPasswordRepository: Repository<UserRecoverPassword>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      await hash(randomKey.generate(8), 10); // avoid user enumerate
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordMatching = await compare(password, user.password);

    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Get user's active team
    const member = await this.memberRepository.findOne({
      where: {
        userId: user.id,
        deletedAt: null
      },
      order: {
        createdAt: 'DESC'
      }
    });

    if (!member) {
      throw new HttpException(
        'User has no team membership',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = await this.jwtService.signAsync(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        activeTeamId: member.teamId
      },
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_TTL'),
        privateKey: this.configService.get('JWT_PRIVATE_KEY'),
      },
    );

    return {
      accessToken,
    };
  }

  async requestResetPassword(requestResetPasswordDto: RequestResetPasswordDto) {
    const { email } = requestResetPasswordDto;
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const token = randomKey.generate(32);
    const baseUrl = this.configService.get('CLIENT_BASE_URL');
    const link = `${baseUrl}/reset-password/${token}`;

    const recoverPassword = this.userRecoverPasswordRepository.create({
      used: false,
      token,
      userId: user.id
    });

    await this.userRecoverPasswordRepository.save(recoverPassword);

    const emailOptions: EmailOptions = {
      to: user.email,
      from: this.configService.get('EMAIL_FROM'),
      subject: 'Password Reset Request',
      text: `To reset your password, click on the link: ${link}`,
      html: `To reset your password, click on the link: <a href="${link}">Reset Password</a>`
    };

    await this.emailService.send(emailOptions);
    return true;
  }

  async validateResetPassword(token: string) {
    const userRecoverPassword = await this.userRecoverPasswordRepository.findOne({
      where: {
        token,
        used: false
      }
    });

    if (!userRecoverPassword) {
      throw new HttpException('Invalid token', HttpStatus.NOT_FOUND);
    }

    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    const userRecoverPassword = await this.userRecoverPasswordRepository.findOne({
      where: {
        token,
        used: false
      }
    });

    if (!userRecoverPassword) {
      throw new HttpException('Invalid token', HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await hash(password, 10);

    await this.userService.update(userRecoverPassword.userId, { password: hashedPassword }, null);
    await this.userRecoverPasswordRepository.update(userRecoverPassword.id, { used: true });

    return true;
  }
}
