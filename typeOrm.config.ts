require('dotenv').config();

import { DataSource } from 'typeorm';
import configuration from './src/config/configuration';
 
export default new DataSource({
  type: 'postgres',
  host: configuration.database.master.host,
  port: configuration.database.master.port,
  username: configuration.database.master.username,
  password: configuration.database.master.password,
  database: configuration.database.dbname,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*.ts'],
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: false,
});
