import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AppConfigModule } from './config/app-config.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    WalletModule,
    DatabaseModule,
    AppConfigModule,
    UserModule,
    AuthModule,
    CategoryModule,
    TransactionModule,
  ],
})
export class AppModule {}
