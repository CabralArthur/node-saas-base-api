import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ParsedUserInfo } from '../interfaces/user.interface';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { RequestResetPasswordDto } from '../dtos/request-reset-password.dto';
import { UserRecoverPassword } from '../entities/user-recover-password.entity';
import { EmailService, EmailOptions } from '../../email/email.service';
import * as randomKey from 'random-key';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserRecoverPassword) private userRecoverPasswordRepository: Repository<UserRecoverPassword>,
    private dataSource: DataSource,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      }
    });
  }

  async findById(id: number) {
    const userInfo = await this.userRepository.findOneOrFail({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    const parsedUserInfo = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
    } as ParsedUserInfo;

    return parsedUserInfo;
  }

  async create(userToCreate: CreateUserDto) {
    const userExists = await this.findByEmail(userToCreate.email);

    if (userExists) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, userToCreate);
      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();

      return true;
    } catch {
      await queryRunner.rollbackTransaction();
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    } finally {
      await queryRunner.release();
    }
  }

  async requestResetPassword(requestResetPasswordDto: RequestResetPasswordDto) {
    const { email } = requestResetPasswordDto;
    const user = await this.findByEmail(email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const token = randomKey.generate(32);

      const recoverPassword = this.userRecoverPasswordRepository.create({
        used: false,
        token,
        userId: user.id
      });

      await queryRunner.manager.save(recoverPassword);

      const baseUrl = this.configService.get('CLIENT_BASE_URL') || 'http://localhost:3000';
      const link = `${baseUrl}/reset-password/${token}`;

      const emailOptions: EmailOptions = {
        to: user.email,
        from: this.configService.get('EMAIL_FROM') || 'noreply@example.com',
        subject: 'Password Reset Request',
        text: `To reset your password, click on the link: ${link}`,
        html: `To reset your password, click on the link: <a href="${link}">Reset Password</a>`
      };

      await this.emailService.send(emailOptions);
      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async validateResetPassword(token: string, returnData = false): Promise<UserRecoverPassword | true> {
    const userRecoverPassword = await this.userRecoverPasswordRepository.findOne({
      where: {
        token,
        used: false
      }
    });

    if (!userRecoverPassword) {
      throw new HttpException('Invalid token', HttpStatus.NOT_FOUND);
    }

    if (!returnData) {
      return true;
    }

    return userRecoverPassword;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;
    const userRecoverPassword = await this.validateResetPassword(token, true) as UserRecoverPassword;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(User, 
        { id: userRecoverPassword.userId },
        { password: password }
      );

      await queryRunner.manager.update(UserRecoverPassword,
        { id: userRecoverPassword.id },
        { used: true }
      );

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
