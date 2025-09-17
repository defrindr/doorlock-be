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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SingleResponseSchema } from '@src/shared/core/decorators/single-schema.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/utils/paginations';
import { CreateRoleDto } from './dto/create-role.dto';
import { PageRoleDto } from './dto/page-role.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';

@ApiTags('Roles')
@Controller('iam/roles')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('/')
  @ApiExtraModels(ApiResponseDto, RoleDto)
  @ApiOkResponse({
    schema: SingleResponseSchema(RoleDto, 'Data berhasil ditambahkan', 201),
  })
  // @PermissionAccess('auth.role.create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get('/')
  @ApiOkResponse({ type: PageRoleDto })
  // @PermissionAccess()
  @HttpCode(200)
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.roleService.findAll(pageOptionsDto);
  }

  @Get('/:id')
  @ApiExtraModels(ApiResponseDto, RoleDto)
  @ApiOkResponse({
    schema: SingleResponseSchema(RoleDto, 'Data berhasil ditambahkan', 201),
  })
  // @PermissionAccess('auth.role.view')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Put('/:id')
  // @PermissionAccess('auth.role.update')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete('/:id')
  // @PermissionAccess('auth.role.delete')
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
