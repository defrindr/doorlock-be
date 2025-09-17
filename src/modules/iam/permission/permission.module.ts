import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionHandler } from './commands/handlers/create-permission.handler';
import { DeletePermissionHandler } from './commands/handlers/delete-permission.handler';
import { UpdatePermissionHandler } from './commands/handlers/update-permission.handler';
import { PermissionController } from './permission.controller';
import { GetPermissionHandler } from './queries/handlers/get-permission.handler';
import { GetPermissionsHandler } from './queries/handlers/get-permissions.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), CqrsModule],
  controllers: [PermissionController],
  providers: [
    CreatePermissionHandler,
    UpdatePermissionHandler,
    DeletePermissionHandler,
    GetPermissionHandler,
    GetPermissionsHandler,
  ],
})
export class PermissionModule {}
