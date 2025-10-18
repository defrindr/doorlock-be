import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import { plainToInstance } from 'class-transformer';
import { DashboardDto } from '../../dto/dashboard.dto';
import { GetDashboardQuery } from '../imp/get-dashboard.query';
import { History } from '@src/modules/histories/entities/history.entity';

@QueryHandler(GetDashboardQuery)
export class GetDashboardHandler
  extends BaseHandler<GetDashboardQuery, ApiResponseDto<DashboardDto>>
  implements IQueryHandler<GetDashboardQuery, ApiResponseDto<DashboardDto>>
{
  constructor(
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {
    super();
  }

  async handle(): Promise<ApiResponseDto<DashboardDto>> {
    const [employeeCount, gateCount, tapInSuccess, tapInFailed, tapInList] =
      await Promise.all([
        this.fetchEmployeeCount(),
        this.fetchGateCount(),
        this.fetchTotalTransactionToday('success'),
        this.fetchTotalTransactionToday('denied'),
        this.fetchLatestHistories(),
      ]);

    const responseDto = plainToInstance(
      DashboardDto,
      {
        employeeCount,
        gateCount,
        tapInSuccess,
        tapInFailed,
        tapInList,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    return OkResponse(
      responseDto,
      'Dashboard information retrieved successfully',
    );
  }

  private fetchEmployeeCount() {
    return this.employeeRepository.count({});
  }

  private fetchGateCount() {
    return this.gateRepository.count({
      where: {
        status: 1,
      },
    });
  }

  private fetchTotalTransactionToday(type: 'success' | 'denied') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return this.historyRepository.count({
      where: {
        timestamp: Between(startOfToday, endOfToday),
        status: type,
      },
    });
  }

  private fetchLatestHistories() {
    return this.historyRepository.find({
      take: 10,
      order: {
        timestamp: 'desc',
      },
    });
  }
}
