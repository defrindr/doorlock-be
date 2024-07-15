import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { DbConfig } from './../config/constant';

export const dbOptions: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: DbConfig.host,
  port: DbConfig.port,
  username: DbConfig.username,
  password: DbConfig.password,
  database: DbConfig.database,
  synchronize: true,
  // autoLoadEntities: true,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  seeds: [__dirname + '/../../**/*.seeder{.ts,.js}'],
};

const dataSource = new DataSource(dbOptions);
export default dataSource;
