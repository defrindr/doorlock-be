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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SingleResponseSchema } from '@src/shared/core/decorators/single-schema.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/utils/paginations';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PagePermissionDto } from './dto/page-permission.dto';
import { ResponsePermissionDto } from './dto/response-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionService } from './permission.service';

@ApiTags('Permissions')
@Controller('iam/permissions')
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

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
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('/')
  @ApiOkResponse({ type: PagePermissionDto })
  // @PermissionAccess('auth.permission.index')
  findAll(@Query() pageOptionsDto: PageOptionsDto): Promise<PagePermissionDto> {
    return this.permissionService.findAll(pageOptionsDto);
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
    return this.permissionService.findOne(id);
  }

  @Put('/:id')
  @ApiExtraModels(ApiResponseDto, ResponsePermissionDto)
  @ApiOkResponse({
    schema: SingleResponseSchema(
      ResponsePermissionDto,
      'Data berhasil diupdate',
    ),
  })
  // @PermissionAccess('auth.permission.update')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'Delete permission by ID',
    type: ApiResponseDto,
  })
  // @PermissionAccess('auth.permission.delete')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
