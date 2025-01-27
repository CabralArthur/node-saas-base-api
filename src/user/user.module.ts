import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRecoverPassword } from './entities/user-recover-password.entity';
import { EmailModule } from '../email/email.module';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRecoverPassword]),
    EmailModule
  ],
  providers: [UserService, EmailService, ConfigService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
