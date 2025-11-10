import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { GateOccupant } from '@src/modules/histories/entities/gate-occupant.entity';
import { History } from '@src/modules/histories/entities/history.entity';
import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { AccountType } from '@src/modules/identities/entities/account-type.enum';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import { plainToInstance } from 'class-transformer';
import { DashboardDto } from '../../dto/dashboard.dto';
import { OccupantDto } from '../../dto/occupant.dto';
import { GetDashboardQuery } from '../imp/get-dashboard.query';

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
    @InjectRepository(GateOccupant)
    private readonly gateOccupantRepository: Repository<GateOccupant>,
  ) {
    super();
  }

  async handle(): Promise<ApiResponseDto<DashboardDto>> {
    const [
      employeeCount,
      gateCount,
      tapInEmployee,
      tapInGuest,
      tapInList,
      peopleInGates,
    ] = await Promise.all([
      this.fetchEmployeeCount(),
      this.fetchGateCount(),
      this.fetchTotalTransactionToday(AccountType.EMPLOYEE),
      this.fetchTotalTransactionToday(AccountType.GUEST),
      this.fetchLatestHistories(),
      this.fetchPeopleInGates(),
    ]);

    const responseDto = plainToInstance(
      DashboardDto,
      {
        employeeCount,
        gateCount,
        tapInEmployee,
        tapInGuest,
        tapInList,
        peopleInGates,
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

  private async fetchTotalTransactionToday(type: AccountType) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const result = await this.historyRepository
      .createQueryBuilder('histories')
      .select('COUNT(DISTINCT histories.accountId)', 'count')
      .innerJoin('histories.account', 'account')
      .where('histories.timestamp BETWEEN :start AND :end', {
        start: startOfToday,
        end: endOfToday,
      })
      .andWhere('histories.status = :status', { status: 'success' })
      .andWhere('account.accountType = :type', { type })
      .getRawOne();

    return parseInt(result.count, 10) || 0;
  }

  private fetchLatestHistories() {
    return this.historyRepository.find({
      take: 5,
      order: {
        timestamp: 'desc',
      },
    });
  }

  private async fetchPeopleInGates() {
    const [personInsideGatesCount, personInsideGates, gates] =
      await Promise.all([
        this.gateOccupantRepository
          .createQueryBuilder('occupant')
          .select([
            'occupant.gateId as gateId',
            'occupant.gateName as gateName',
            'COUNT(occupant.accountId) as count',
          ])
          .groupBy('occupant.gateId')
          .addGroupBy('occupant.gateName')
          .orderBy('occupant.gateName', 'ASC')
          .getRawMany()
          .then((rawResults) => {
            return rawResults.reduce((acc, result) => {
              acc[result.gateId] = {
                count: parseInt(result.count, 10),
              };
              return acc;
            }, {});
          }),
        this.gateOccupantRepository
          .createQueryBuilder('occupant')
          .orderBy('occupant.gateName', 'ASC')
          .getMany()
          .then((rawResults): { [key: string]: OccupantDto[] } => {
            return rawResults.reduce((acc: any, result) => {
              if (!acc?.[result.gateId]) acc[result.gateId] = [];
              acc[result.gateId].push({
                name: result.accountName,
                identifier: result.accountIdentifier,
                companyName: result.companyName,
              });
              return acc;
            }, {});
          }),
        this.gateRepository.find({
          where: {
            status: 1,
          },
          order: {
            gateIdentifier: 'ASC',
          },
        }),
      ]);

    const allGates = gates.map((result) => ({
      gateId: result.id,
      gateName: result.name || 'Unknown Gate',
      count: personInsideGatesCount[result.id]?.count ?? 0,
      list: personInsideGates?.[result.id] ?? [],
    }));

    return allGates;
  }
}
