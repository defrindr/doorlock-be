import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfig } from '@src/config/index';
import { JwtAuthGuard } from '@src/shared/core/guards/jwt-auth.guard';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginHandler } from './command/handlers/login.handler';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshTokenHandler } from './command/handlers/refresh-token.handler';
import { GetProfileHandler } from './query/handlers/get-profile.handler';

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
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
    LoginHandler,
    RefreshTokenHandler,
    GetProfileHandler,
  ],
})
export class AuthModule {}
