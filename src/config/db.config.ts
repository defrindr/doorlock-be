import { env } from 'process';

export const DbConfig = {
  type: env.DBSERVICE_AUTH_PROTOCOL || 'mysql',
  host: env.DBSERVICE_AUTH_HOST || '127.0.0.1',
  port: parseInt(env.DBSERVICE_AUTH_PORT || '3306'),
  username: env.DBSERVICE_AUTH_USER || 'devuser',
  password: env.DBSERVICE_AUTH_PASSWORD || 'devpass',
  database: env.DBSERVICE_AUTH_DATABASE || 'devdb',
};
