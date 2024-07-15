import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';
import { PageOptionsDto } from '@src/lib/paginations';
import { PermissionAccess } from '@src/lib/decorators/permission-access.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('roles')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('/')
  @HttpCode(201)
  @PermissionAccess('auth.role.create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('/')
  @PermissionAccess()
  @HttpCode(200)
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.roleService.findAll(pageOptionsDto);
  }

  @Get('/:id')
  @PermissionAccess('auth.role.view')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Put('/:id')
  @PermissionAccess('auth.role.update')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete('/:id')
  @PermissionAccess('auth.role.delete')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
