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
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiPaginatedResponse } from '@src/shared/core/decorators/api-paginated-response.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
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
  @ApiOperation({
    summary: 'Create new Role',
    description:
      'Creates a new role in the system with specified permissions and attributes. Roles define what actions users can perform within the application.',
  })
  @ApiSingleResponse(RoleDto, 'Data berhasil ditambahkan', 201)
  @ApiCommonErrors()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.commandBus.execute(new CreateRoleCommand(createRoleDto));
  }

  @Get('/')
  @ApiOperation({
    summary: 'Fetch all Roles with pagination',
    description:
      'Retrieves a paginated list of all roles in the system. Supports filtering, sorting, and searching capabilities through query parameters.',
  })
  @ApiExtraModels(PageRoleDto)
  @ApiPaginatedResponse(PageRoleDto)
  @ApiCommonErrors()
  @HttpCode(200)
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.queryBus.execute(new GetRolesQuery(pageOptionsDto));
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Find specific role',
    description:
      'Retrieves detailed information about a specific role by its unique identifier. Returns complete role data including associated permissions.',
  })
  @ApiSingleResponse(RoleDto, 'Data berhasil didapatkan', 200)
  @ApiCommonErrors()
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetRoleQuery(id));
  }

  @Put('/:id')
  @ApiOperation({
    summary: 'Update existing Role',
    description:
      'Updates an existing role with new information. Supports partial updates - only provided fields will be modified while preserving existing data and permissions.',
  })
  @ApiSingleResponse(RoleDto, 'Data berhasil diubah', 200)
  @ApiCommonErrors()
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.commandBus.execute(new UpdateRoleCommand(id, updateRoleDto));
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Delete Role',
    description:
      'Permanently removes a role from the system. This action cannot be undone. Users assigned to this role will lose the associated permissions.',
  })
  @ApiOkResponse({ description: 'Data berhasil dihapus', type: ApiResponseDto })
  @ApiCommonErrors()
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteRoleCommand(id));
  }
}
