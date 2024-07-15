import { env } from 'process';
import 'dotenv/config';

export const AppConfig = {
  host: env.APP_HOST || 'localhost',
  port: env.APP_PORT ? parseInt(env.APP_PORT) : 8080,
  name: env.APP_NAME || 'NestJS Ready Started Pack',
};

export const JwtConfig = {
  secretKey: env.JWT_SECRET_KEY || 'inirahasianegara',
  expiresIn: env.JWT_EXPIRED_IN || '1d',
};
export const DbConfig = {
  host: env.DBSERVICE_AUTH_HOST,
  port: parseInt(env.DBSERVICE_AUTH_PORT || '3306'),
  username: env.DBSERVICE_AUTH_USER,
  password: env.DBSERVICE_AUTH_PASSWORD,
  database: env.DBSERVICE_AUTH_DATABASE,
};

export const BYPASS_AUTHOR = [''];
