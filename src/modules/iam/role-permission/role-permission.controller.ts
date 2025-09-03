import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { RolePermissionService } from './role-permission.service';
import { PermissionAccess } from '@src/shared/core/decorators/permission-access.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('role-permission')
@ApiBearerAuth()
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post('/')
  @PermissionAccess('auth.role-permission.create')
  create(@Body() createRolePermissionDto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(createRolePermissionDto);
  }

  @Delete('/:id')
  @PermissionAccess('auth.role-permission.delete')
  remove(@Param('id') id: number) {
    return this.rolePermissionService.remove(id);
  }
}
