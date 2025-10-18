import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { SyncHistoryCommand } from './commands/imp/sync-history.command';
import { PageHistoryDto } from './dto/page-history.dto';
import { SyncHistoryDto } from './dto/sync-history.dto';
import { GetHistoriesQuery } from './queries/imp/get-histories.query';
import { ExportHistoriesQuery } from './queries/imp/export-histories.query';
import { PermissionAccess } from '@src/shared/core/decorators/permission-access.decorator';

@Controller('histories')
@ApiTags('Histories')
export class HistoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Sync an history from hardware', description: '' })
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
  @PermissionAccess()
  async findAll(
    @Query()
    pageOptionsDto: PageOptionsDto & {
      timestamp?: { start: string; end: string };
    },
  ): Promise<PageHistoryDto> {
    return this.queryBus.execute(new GetHistoriesQuery(pageOptionsDto));
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export histories to Excel or PDF',
    description:
      'Export access history records with applied filters to Excel or PDF format',
  })
  @ApiOkResponse({
    description: 'File exported successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
      'application/pdf': {},
    },
  })
  @ApiCommonErrors()
  @PermissionAccess()
  async exportHistories(
    @Query()
    pageOptionsDto: PageOptionsDto & {
      timestamp?: { start: string; end: string };
      format: 'excel' | 'pdf';
    },
  ): Promise<StreamableFile> {
    const { format, ...filters } = pageOptionsDto;
    const buffer = await this.queryBus.execute(
      new ExportHistoriesQuery(format, filters),
    );

    const fileName = `histories_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    const mimeType =
      format === 'excel'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';

    return new StreamableFile(buffer, {
      type: mimeType,
      disposition: `attachment; filename="${fileName}"`,
    });
  }
}
