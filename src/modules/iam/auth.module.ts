import { Module } from '@nestjs/common';
import { PermissionModule } from './permission/permission.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfig } from '@src/config/index';
import { JwtAuthGuard } from '@src/shared/core/guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RoleModule } from './role/role.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { User } from './entities/user.entity';
import { UsersModule } from './users/users.module';
import { RolePermission } from './entities/role-permission.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: JwtConfig.secretKey,
      signOptions: { expiresIn: JwtConfig.expiresIn },
    }),
    TypeOrmModule.forFeature([User, Role, Permission, RolePermission]),
    UsersModule,
    RoleModule,
    PermissionModule,
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
export class IamModule {}
