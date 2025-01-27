import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from 'src/config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      autoLoadEntities: true,
      extra: {
        pool: {
          max: 20,
          min: 5,
          idle: 10000,
          acquire: 30000,
        },
      },
      host: configuration.database.master.host,
      database: configuration.database.dbname,
      port: configuration.database.master.port,
      username: configuration.database.master.username,
      password: configuration.database.master.password,
      ssl: {
        rejectUnauthorized: false
      },
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {}
