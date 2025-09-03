import { env } from 'process';

export const AppConfig = {
  host: env.APP_HOST || 'localhost',
  port: env.APP_PORT ? parseInt(env.APP_PORT) : 8080,
  name: env.APP_NAME || 'NestJS Ready Started Pack',
};
