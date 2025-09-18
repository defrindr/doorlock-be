import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';

import { CreateGateDto } from './dto/create-gate.dto';
import { GateDto } from './dto/gate.dto';
import { PageGateDto } from './dto/page-gate.dto';
import { UpdateGateDto } from './dto/update-gate.dto';

import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { CreateGateCommand } from './commands/imp/create-gate.command';
import { DeleteGateCommand } from './commands/imp/delete-gate.command';
import { UpdateGateCommand } from './commands/imp/update-gate.command';
import { GetGateQuery } from './queries/imp/get-gate.query';
import { GetGatesQuery } from './queries/imp/get-gates.query';

@ApiTags('gates')
@Controller('gates')
export class GatesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new gate' })
  @ApiSingleResponse(GateDto, 'Gate created successfully', 201)
  @ApiCommonErrors()
  async create(
    @Body() createGateDto: CreateGateDto,
  ): Promise<ApiResponseDto<GateDto>> {
    const command = new CreateGateCommand(createGateDto);
    return await this.commandBus.execute(command);
  }

  @Get()
  @ApiOperation({ summary: 'Get all gates with pagination' })
  @ApiSingleResponse(GateDto, 'Gates retrieved successfully', 200)
  @ApiCommonErrors()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<ApiResponseDto<PageGateDto>> {
    const query = new GetGatesQuery(pageOptionsDto);
    return await this.queryBus.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gate by ID' })
  @ApiSingleResponse(GateDto, 'Gate retrieved successfully', 200)
  @ApiCommonErrors()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<GateDto>> {
    const query = new GetGateQuery(id);
    return await this.queryBus.execute(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update gate by ID' })
  @ApiSingleResponse(GateDto, 'Gate updated successfully', 200)
  @ApiCommonErrors()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGateDto: UpdateGateDto,
  ): Promise<ApiResponseDto<GateDto>> {
    const command = new UpdateGateCommand(id, updateGateDto);
    return await this.commandBus.execute(command);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete gate by ID' })
  @ApiOkResponse({
    description: 'Gate deleted successfully',
    type: ApiResponseDto,
  })
  @ApiCommonErrors()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<null>> {
    const command = new DeleteGateCommand(id);
    return await this.commandBus.execute(command);
  }
}
