import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfig } from '@src/config/index';
import { JwtAuthGuard } from '@src/shared/core/guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { JwtStrategy } from './strategy/jwt.strategy';
import { Role } from '../entities/role.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: JwtConfig.secretKey,
      signOptions: { expiresIn: JwtConfig.expiresIn },
    }),
    TypeOrmModule.forFeature([User, Role]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
  ],
})
export class AuthModule {}
