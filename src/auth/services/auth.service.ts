import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as randomKey from 'random-key';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { RequestResetPasswordDto } from '../dtos/request-reset-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { UserService } from '../../user/services/user.service';
import { ConfigService } from '@nestjs/config';
import { EmailService, EmailOptions } from '../../email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserRecoverPassword } from '../../user/entities/user-recover-password.entity';
import { Member } from '../../team/entities/member.entity';
import { Team } from '../../team/entities/team.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
    @InjectRepository(UserRecoverPassword)
    private userRecoverPasswordRepository: Repository<UserRecoverPassword>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, confirm_password } = registerDto;

    if (password !== confirm_password) {
      throw new HttpException('Passwords do not match', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new HttpException('Invalid user information', HttpStatus.UNAUTHORIZED);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create team
      const team = queryRunner.manager.create(Team, {
        name: `${name}'s Team`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const createdTeam = await queryRunner.manager.save(Team, team);

      // Create user
      const user = queryRunner.manager.create(User, {
        name,
        email,
        password,
        activeTeamId: createdTeam.id,
      });

      const createdUser = await queryRunner.manager.save(User, user);

      // Create team membership
      const member = queryRunner.manager.create(Member, {
        userId: createdUser.id,
        teamId: createdTeam.id,
        role: 'ADMIN',
      });

      await queryRunner.manager.save(Member, member);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
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
