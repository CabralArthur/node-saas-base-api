import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    EmailModule,
    TeamModule
  ],
})
export class AppModule {}
