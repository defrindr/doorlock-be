import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { PermissionAccess } from '@src/shared/core/decorators/permission-access.decorator';
import { DashboardDto } from './dto/dashboard.dto';
import { GetDashboardQuery } from './queries/imp/get-dashboard.query';

@Controller('general/dashboard')
@ApiTags('Dashboard')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Get dashboard information',
    description:
      'Retrieve dashboard statistics including employee count, gate count, tap-in success/failure metrics, and recent tap-in history',
  })
  @ApiOkResponse({
    description: 'Dashboard information retrieved successfully',
    type: DashboardDto,
  })
  @ApiCommonErrors()
  @PermissionAccess()
  async getDashboardInformation(): Promise<DashboardDto> {
    return this.queryBus.execute(new GetDashboardQuery());
  }
}
