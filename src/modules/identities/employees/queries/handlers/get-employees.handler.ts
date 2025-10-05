import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageMetaDto } from '@src/shared/paginations';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { GetEmployeesQuery } from '../imp/get-employees.query';
import { EmployeeDto } from '../../dto/employee.dto';
import { PageEmployeeDto } from '../../dto/page-employee.dto';

@QueryHandler(GetEmployeesQuery)
export class GetEmployeesHandler
  extends BaseHandler<GetEmployeesQuery, ApiResponseDto<PageEmployeeDto>>
  implements IQueryHandler<GetEmployeesQuery, ApiResponseDto<PageEmployeeDto>>
{
  constructor(
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
  ) {
    super();
  }

  async handle(
    query: GetEmployeesQuery,
  ): Promise<ApiResponseDto<PageEmployeeDto>> {
    const { pageOptionsDto } = query;

    const queryBuilder = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.account', 'account')
      .leftJoinAndSelect('employee.supervisor', 'supervisor')
      .leftJoinAndSelect('employee.location', 'location');

    // Apply search filter
    if (pageOptionsDto.search) {
      queryBuilder.andWhere(
        '(employee.fullName LIKE :search OR employee.employeeNumber LIKE :search OR employee.department LIKE :search OR employee.position LIKE :search)',
        { search: `%${pageOptionsDto.search}%` },
      );
    }

    // Apply sorting
    if (pageOptionsDto.sort) {
      Object.entries(pageOptionsDto.sort).forEach(([key, value]) => {
        queryBuilder.addOrderBy(`employee.${key}`, value as 'ASC' | 'DESC');
      });
    } else {
      queryBuilder.orderBy('employee.createdAt', 'DESC');
    }

    // Apply pagination
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    const employeeDtos = plainToInstance(EmployeeDto, entities, {
      excludeExtraneousValues: true,
    });

    const pageDto = new PageEmployeeDto(employeeDtos, pageMetaDto);

    return OkResponse(pageDto, 'Employees retrieved successfully');
  }
}
