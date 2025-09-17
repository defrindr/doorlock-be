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
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiPaginatedResponse } from '@src/shared/core/decorators/api-paginated-response.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { CreatePermissionCommand } from './commands/imp/create-permission.command';
import { DeletePermissionCommand } from './commands/imp/delete-permission.command';
import { UpdatePermissionCommand } from './commands/imp/update-permission.command';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PagePermissionDto } from './dto/page-permission.dto';
import { ResponsePermissionDto } from './dto/response-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { GetPermissionQuery } from './queries/imp/get-permission.query';
import { GetPermissionsQuery } from './queries/imp/get-permissions.query';

@ApiTags('Permissions')
@Controller('iam/permissions')
@ApiBearerAuth()
export class PermissionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/')
  @ApiSingleResponse(ResponsePermissionDto, 'Data berhasil ditambahkan')
  @ApiCommonErrors()
  create(@Body() payload: CreatePermissionDto) {
    return this.commandBus.execute(new CreatePermissionCommand(payload));
  }

  @Get('/')
  @ApiPaginatedResponse(ResponsePermissionDto)
  @ApiCommonErrors()
  findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PagePermissionDto> {
    return this.queryBus.execute(new GetPermissionsQuery(pageOptionsDto));
  }

  @Get('/:id')
  @ApiSingleResponse(ResponsePermissionDto, 'Data berhasil didapatkan')
  @ApiCommonErrors()
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetPermissionQuery(id));
  }

  @Put('/:id')
  @ApiSingleResponse(ResponsePermissionDto, 'Data berhasil diubah')
  @ApiCommonErrors()
  @ApiBody({ type: UpdatePermissionDto })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.commandBus.execute(
      new UpdatePermissionCommand(id, updatePermissionDto),
    );
  }

  @Delete('/:id')
  @ApiOkResponse({ description: 'Data berhasil dihapus', type: ApiResponseDto })
  @ApiCommonErrors()
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeletePermissionCommand(id));
  }
}
