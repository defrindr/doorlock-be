import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { CreateVisitCommand } from './commands/imp/create-visit.command';
import { DeleteVisitCommand } from './commands/imp/delete-visit.command';
import { SyncParticipantGatesCommand } from './commands/imp/sync-participant-gates.command';
import { UpdateVisitCommand } from './commands/imp/update-visit.command';
import { CreateVisitDto } from './dto/create-visit.dto';
import { PageVisitDto } from './dto/page-visit.dto';
import { SyncParticipantGatesDto } from './dto/sync-participant-gates.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitActionResponseDto } from './dto/visit-action-response.dto';
import { VisitDto } from './dto/visit.dto';
import { GetVisitQuery } from './queries/imp/get-visit.query';
import { GetVisitsQuery } from './queries/imp/get-visits.query';

@Controller('visits')
@ApiTags('Visits')
@ApiBearerAuth()
export class VisitsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new visit',
    description:
      'Create a new visit record in the system with provided details such as visitor information, time, and purpose.',
  })
  @ApiSingleResponse(VisitActionResponseDto, 'Visit created successfully', 201)
  @ApiCommonErrors()
  async create(
    @Body() createVisitDto: CreateVisitDto,
  ): Promise<ApiResponseDto<VisitActionResponseDto>> {
    return this.commandBus.execute(new CreateVisitCommand(createVisitDto));
  }

  @Get()
  @ApiOperation({
    summary: 'Get list of visits with pagination',
    description:
      'Retrieve a paginated list of visit records with optional sorting and filtering.',
  })
  @ApiOkResponse({
    description: 'Visits retrieved successfully',
    type: PageVisitDto,
  })
  @ApiCommonErrors()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageVisitDto> {
    return this.queryBus.execute(new GetVisitsQuery(pageOptionsDto));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get visit by ID',
    description:
      'Retrieve detailed information of a specific visit using its unique identifier.',
  })
  @ApiSingleResponse(VisitDto, 'Visit retrieved successfully')
  @ApiCommonErrors()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<VisitDto>> {
    return this.queryBus.execute(new GetVisitQuery(id));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update visit by ID',
    description:
      'Update existing visit information such as visitor details, time, or purpose.',
  })
  @ApiSingleResponse(VisitActionResponseDto, 'Visit updated successfully')
  @ApiCommonErrors()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVisitDto: UpdateVisitDto,
  ): Promise<ApiResponseDto<VisitActionResponseDto>> {
    return this.commandBus.execute(new UpdateVisitCommand(id, updateVisitDto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete visit by ID',
    description:
      'Permanently remove a visit record from the system using its unique identifier.',
  })
  @ApiOkResponse({
    description: 'Visit deleted successfully',
    type: ApiResponseDto,
  })
  @ApiCommonErrors()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(new DeleteVisitCommand(id));
  }

  @Post('participants/:visitId/:participantId/gates')
  @ApiOperation({
    summary: 'Sync gates for visit participant',
    description:
      'Synchronize gate assignments for a specific visit participant. Gates in the request will be assigned, gates not in the request will be removed.',
  })
  @ApiOkResponse({
    description: 'Participant gates synchronized successfully',
    type: ApiResponseDto,
  })
  @ApiCommonErrors()
  async syncParticipantGates(
    @Param('visitId', ParseUUIDPipe) visitId: string,
    @Param('participantId', ParseUUIDPipe) participantId: string,
    @Body() syncGatesDto: SyncParticipantGatesDto,
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(
      new SyncParticipantGatesCommand(visitId, participantId, syncGatesDto),
    );
  }
}
