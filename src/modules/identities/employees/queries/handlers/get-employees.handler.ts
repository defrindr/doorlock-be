import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { PageMetaDto } from '@src/shared/paginations';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { EmployeeDto } from '../../dto/employee.dto';
import { PageEmployeeDto } from '../../dto/page-employee.dto';
import { GetEmployeesQuery } from '../imp/get-employees.query';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';

@QueryHandler(GetEmployeesQuery)
export class GetEmployeesHandler
  extends BaseHandler<GetEmployeesQuery, PageEmployeeDto>
  implements IQueryHandler<GetEmployeesQuery, PageEmployeeDto>
{
  constructor(
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
  ) {
    super();
  }

  async handle(query: GetEmployeesQuery): Promise<PageEmployeeDto> {
    const { pageOptionsDto } = query;

    let qb = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.account', 'account')
      .leftJoinAndSelect('employee.company', 'company')
      .leftJoinAndSelect('employee.supervisor', 'supervisor')
      .leftJoinAndSelect('employee.location', 'location')
      .leftJoinAndSelect('employee.accesses', 'accesses');

    qb = applyPaginationFilters(qb, {
      alias: 'employee',
      allowedSort: ['id', 'fullName', 'status', 'createdAt', 'locationId'],
      allowedSearch: ['fullName', 'employeeNumber'],
      allowedFilter: ['id', 'fullName', 'status', 'locationId'],
      pageOptions: pageOptionsDto,
    });

    const [employees, total] = await qb.getManyAndCount();

    const employeeDtos = plainToInstance(EmployeeDto, employees, {
      excludeExtraneousValues: true,
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto,
    });

    return new PageEmployeeDto(employeeDtos, pageMetaDto);
  }
}
