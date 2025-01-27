import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AppConfigModule } from './config/app-config.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    AppConfigModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
