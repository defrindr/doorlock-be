import { Module } from '@nestjs/common';
import { PermissionModule } from './permission/permission.module';
import { RolePermissionModule } from './role-permission/role-permission.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtConfig } from '@src/config/constant';
import { JwtAuthGuard } from '@src/shared/guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Permission } from './permission/entities/permission.entity';
import { RolePermission } from './role-permission/entities/role-permission.entity';
import { Role } from './role/entities/role.entity';
import { RoleModule } from './role/role.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

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
    RolePermissionModule,
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
