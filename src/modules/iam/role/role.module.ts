import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleHandler } from './commands/handlers/create-role.handler';
import { DeleteRoleHandler } from './commands/handlers/delete-role.handler';
import { UpdateRoleHandler } from './commands/handlers/update-role.handler';
import { GetRoleHandler } from './queries/handlers/get-role.handler';
import { GetRolesHandler } from './queries/handlers/get-roles.handler';
import { RoleController } from './role.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), CqrsModule],
  controllers: [RoleController],
  providers: [
    CreateRoleHandler,
    UpdateRoleHandler,
    DeleteRoleHandler,
    GetRoleHandler,
    GetRolesHandler,
  ],
})
export class RoleModule {}
