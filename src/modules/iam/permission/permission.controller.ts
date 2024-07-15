import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PageOptionsDto } from '@src/lib/paginations';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionService } from './permission.service';
import { PermissionAccess } from '@src/lib/decorators/permission-access.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('permissions')
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('/')
  @PermissionAccess('auth.permission.create')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('/')
  @PermissionAccess('auth.permission.index')
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.permissionService.findAll(pageOptionsDto);
  }

  @Get('/:id')
  @PermissionAccess('auth.permission.view')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Put('/:id')
  @PermissionAccess('auth.permission.update')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete('/:id')
  @PermissionAccess('auth.permission.delete')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
