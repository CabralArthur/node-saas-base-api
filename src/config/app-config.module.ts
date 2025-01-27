import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
  ],
})
export class AppConfigModule {}
