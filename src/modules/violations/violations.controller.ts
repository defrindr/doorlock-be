import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { PermissionAccess } from '@src/shared/core/decorators/permission-access.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { CreateViolationCommand } from './commands/imp/create-violation.command';
import { DeleteViolationCommand } from './commands/imp/delete-violation.command';
import { CreateViolationDto } from './dto/create-violation.dto';
import { PageViolationDto } from './dto/page-violation.dto';
import { ViolationDto } from './dto/violation.dto';
import { GetViolationQuery } from './queries/imp/get-violation.query';
import { GetViolationsQuery } from './queries/imp/get-violations.query';
import { MarkScannedViolationCommand } from './commands/imp/mark-scanned-violation.command';

@Controller('violations')
@ApiTags('Violations')
export class ViolationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new violation', description: '' })
  @ApiSingleResponse(ViolationDto, 'Violation created successfully', 201)
  @ApiCommonErrors()
  @PermissionAccess('violation:manage')
  async create(
    @Body() createViolationDto: CreateViolationDto,
  ): Promise<ApiResponseDto<ViolationDto>> {
    const violation = await this.commandBus.execute(
      new CreateViolationCommand(createViolationDto),
    );
    return new ApiResponseDto(201, 'Violation created successfully', violation);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all violations with pagination',
    description: '',
  })
  @ApiOkResponse({
    description: 'Violations retrieved successfully',
    type: PageViolationDto,
  })
  @ApiCommonErrors()
  @PermissionAccess()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageViolationDto> {
    return this.queryBus.execute(new GetViolationsQuery(pageOptionsDto));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get violation by ID',
    description: '',
  })
  @ApiOkResponse({
    description: 'Violation retrieved successfully',
    type: ViolationDto,
  })
  @ApiCommonErrors()
  @PermissionAccess()
  async findOne(@Param('id') id: string): Promise<ViolationDto> {
    return this.queryBus.execute(new GetViolationQuery(id));
  }

  @Get(':id/scanned')
  @ApiOperation({
    summary: 'Mark violation scanned by ID',
    description: '',
  })
  @ApiOkResponse({
    description: 'Violation mark scanned successfully',
    type: ViolationDto,
  })
  @ApiCommonErrors()
  @PermissionAccess()
  async markScanned(@Param('id') id: string): Promise<ViolationDto> {
    return this.commandBus.execute(new MarkScannedViolationCommand(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete violation by ID', description: '' })
  @ApiSingleResponse(null, 'Violation deleted successfully', 200)
  @PermissionAccess('violation:manage')
  async remove(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.commandBus.execute(new DeleteViolationCommand(id));
    return new ApiResponseDto(200, 'Violation deleted successfully', null);
  }
}
