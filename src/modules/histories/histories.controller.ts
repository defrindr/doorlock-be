import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { SyncHistoryCommand } from './commands/imp/sync-history.command';
import { PageHistoryDto } from './dto/page-history.dto';
import { SyncHistoryDto } from './dto/sync-history.dto';
import { GetHistoriesQuery } from './queries/imp/get-histories.query';

@Controller('histories')
@ApiTags('histories')
@ApiBearerAuth()
export class HistoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'sync an history from hardware', description: '' })
  @ApiSingleResponse(null, 'History sync successfully', 201)
  @ApiCommonErrors()
  @ApiBody({
    type: SyncHistoryDto,
    isArray: true,
  })
  async sync(
    @Body() createHistoryDto: SyncHistoryDto[],
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(new SyncHistoryCommand(createHistoryDto));
  }

  @Get()
  @ApiOperation({
    summary: 'Get all histories with pagination',
    description: '',
  })
  @ApiOkResponse({
    description: 'Histories retrieved successfully',
    type: PageHistoryDto,
  })
  @ApiCommonErrors()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageHistoryDto> {
    return this.queryBus.execute(new GetHistoriesQuery(pageOptionsDto));
  }
}
