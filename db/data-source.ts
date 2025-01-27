import { DataSource, DataSourceOptions } from 'typeorm';
import configuration from 'src/config/configuration';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configuration.database.master.host,
  username: configuration.database.master.username,
  password: configuration.database.master.password,
  database: configuration.database.dbname,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
