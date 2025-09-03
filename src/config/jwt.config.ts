import { env } from 'process';

export const JwtConfig = {
  secretKey: env.JWT_SECRET_KEY || 'inirahasianegara',
  expiresIn: env.JWT_EXPIRED_IN || '1d',
};
