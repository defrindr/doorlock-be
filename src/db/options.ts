import { DataSource, DataSourceOptions, Db } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { DbConfig } from './../config/constant';

export const dbOptions: DataSourceOptions & SeederOptions = {
  type: DbConfig.type as any,
  host: DbConfig.host,
  port: DbConfig.port,
  username: DbConfig.username,
  password: DbConfig.password,
  database: DbConfig.database,
  synchronize: false,
  options: {
    encrypt: false, // set true if using Azure or SSL
    enableArithAbort: true,
  },
  // autoLoadEntities: true,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/db/migrations/*.js'],
  seeds: [__dirname + '/../../**/*.seeder{.ts,.js}'],
};

const dataSource = new DataSource(dbOptions);
export default dataSource;
