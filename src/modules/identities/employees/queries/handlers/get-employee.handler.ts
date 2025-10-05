import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { GetEmployeeQuery } from '../imp/get-employee.query';
import { EmployeeDto } from '../../dto/employee.dto';

@QueryHandler(GetEmployeeQuery)
export class GetEmployeeHandler
  extends BaseHandler<GetEmployeeQuery, ApiResponseDto<EmployeeDto>>
  implements IQueryHandler<GetEmployeeQuery, ApiResponseDto<EmployeeDto>>
{
  constructor(
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
  ) {
    super();
  }

  async handle(query: GetEmployeeQuery): Promise<ApiResponseDto<EmployeeDto>> {
    const { id } = query;

    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['account', 'supervisor', 'location'],
    });

    if (!employee) {
      throw new NotFoundHttpException('Employee not found');
    }

    const employeeDto = plainToInstance(EmployeeDto, employee, {
      excludeExtraneousValues: true,
    });

    return OkResponse(employeeDto, 'Employee retrieved successfully');
  }
}
