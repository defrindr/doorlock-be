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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SingleResponseSchema } from '@src/shared/core/decorators/single-schema.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/utils/paginations';
import { CreatePermissionCommand } from './commands/create-permission.command';
import { DeletePermissionCommand } from './commands/delete-permission.command';
import { UpdatePermissionCommand } from './commands/update-permission.command';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PagePermissionDto } from './dto/page-permission.dto';
import { ResponsePermissionDto } from './dto/response-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GetPermissionQuery } from './queries/get-permission.query';
import { GetPermissionsQuery } from './queries/get-permissions.query';

@ApiTags('Permissions')
@Controller('iam/permissions')
@ApiBearerAuth()
export class PermissionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/')
  @ApiExtraModels(ApiResponseDto, ResponsePermissionDto)
  @ApiOkResponse({
    schema: SingleResponseSchema(
      ResponsePermissionDto,
      'Data berhasil ditambahkan',
      201,
    ),
  })
  // @PermissionAccess('auth.permission.create')
  create(@Body() payload: CreatePermissionDto) {
    return this.commandBus.execute(new CreatePermissionCommand(payload));
  }

  @Get('/')
  @ApiOkResponse({ type: PagePermissionDto })
  // @PermissionAccess('auth.permission.index')
  findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PagePermissionDto> {
    return this.queryBus.execute(new GetPermissionsQuery(pageOptionsDto));
  }

  @Get('/:id')
  @ApiExtraModels(ApiResponseDto, ResponsePermissionDto)
  @ApiOkResponse({
    schema: SingleResponseSchema(
      ResponsePermissionDto,
      'Data berhasil dapatkan',
    ),
  })
  // @PermissionAccess('auth.permission.view')
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetPermissionQuery(id));
  }

  @Put('/:id')
  @ApiExtraModels(ApiResponseDto, ResponsePermissionDto)
  @ApiOkResponse({
    schema: SingleResponseSchema(
      ResponsePermissionDto,
      'Data berhasil diupdate',
    ),
  })
  @ApiBody({ type: UpdatePermissionDto })
  // @PermissionAccess('auth.permission.update')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.commandBus.execute(
      new UpdatePermissionCommand(id, updatePermissionDto),
    );
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'Delete permission by ID',
    type: ApiResponseDto,
  })
  // @PermissionAccess('auth.permission.delete')
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeletePermissionCommand(id));
  }
}
