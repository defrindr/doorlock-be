import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfig } from '@src/config/index';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginHandler } from './command/handlers/login.handler';
import { RefreshTokenHandler } from './command/handlers/refresh-token.handler';
import { GetProfileHandler } from './query/handlers/get-profile.handler';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: JwtConfig.secretKey,
      signOptions: { expiresIn: JwtConfig.expiresIn },
    }),
    TypeOrmModule.forFeature([User, Role]),
    CqrsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LoginHandler,
    RefreshTokenHandler,
    GetProfileHandler,
  ],
})
export class AuthModule {}
