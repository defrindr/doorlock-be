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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SingleResponseSchema } from '@src/shared/core/decorators/single-schema.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { CreateRoleCommand } from './commands/imp/create-role.command';
import { DeleteRoleCommand } from './commands/imp/delete-role.command';
import { UpdateRoleCommand } from './commands/imp/update-role.command';
import { CreateRoleDto } from './dto/create-role.dto';
import { PageRoleDto } from './dto/page-role.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GetRoleQuery } from './queries/imp/get-role.query';
import { GetRolesQuery } from './queries/imp/get-roles.query';

@ApiTags('Roles')
@Controller('iam/roles')
@ApiBearerAuth()
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/')
  @ApiExtraModels(ApiResponseDto, RoleDto)
  @ApiOkResponse({
    schema: SingleResponseSchema(RoleDto, 'Data berhasil ditambahkan', 201),
  })
  // @PermissionAccess('auth.role.create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.commandBus.execute(new CreateRoleCommand(createRoleDto));
  }

  @Get('/')
  @ApiOkResponse({ type: PageRoleDto })
  // @PermissionAccess()
  @HttpCode(200)
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.queryBus.execute(new GetRolesQuery(pageOptionsDto));
  }

  @Get('/:id')
  @ApiExtraModels(ApiResponseDto, RoleDto)
  @ApiOkResponse({
    schema: SingleResponseSchema(RoleDto, 'Data berhasil ditambahkan', 201),
  })
  // @PermissionAccess('auth.role.view')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetRoleQuery(id));
  }

  @Put('/:id')
  // @PermissionAccess('auth.role.update')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.commandBus.execute(new UpdateRoleCommand(id, updateRoleDto));
  }

  @Delete('/:id')
  // @PermissionAccess('auth.role.delete')
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteRoleCommand(id));
  }
}
