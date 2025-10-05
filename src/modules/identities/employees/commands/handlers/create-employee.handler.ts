import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { Account } from '@src/modules/identities/entities/account.entity';
import { AccountType } from '@src/modules/identities/entities/account-type.enum';
import { CreateEmployeeCommand } from '../imp/create-employee.command';
import { EmployeeDto } from '../../dto/employee.dto';

@CommandHandler(CreateEmployeeCommand)
export class CreateEmployeeHandler
  extends BaseHandler<CreateEmployeeCommand, ApiResponseDto<EmployeeDto>>
  implements ICommandHandler<CreateEmployeeCommand, ApiResponseDto<EmployeeDto>>
{
  constructor(
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {
    super();
  }

  async handle(
    command: CreateEmployeeCommand,
  ): Promise<ApiResponseDto<EmployeeDto>> {
    const { createEmployeeDto } = command;

    // Validate employee number uniqueness
    const existingEmployee = await this.employeeRepository.findOne({
      where: { employeeNumber: createEmployeeDto.employeeNumber },
    });

    if (existingEmployee) {
      throw new BadRequestHttpException(
        'Employee number already exists in the system',
      );
    }

    // Extract account-related fields
    const { photo, status, nfcCode, ...employeeData } = createEmployeeDto;

    // Create Account
    const account = this.accountRepository.create({
      accountType: AccountType.EMPLOYEE,
      photo: photo,
      status: status ?? 1,
      nfcCode: nfcCode,
    });

    const savedAccount = await this.accountRepository.save(account);

    // Create Employee
    const employee = this.employeeRepository.create({
      ...employeeData,
      accountId: savedAccount.id,
      violationPoints: createEmployeeDto.violationPoints ?? 10,
    });

    const savedEmployee = await this.employeeRepository.save(employee);

    // Fetch complete data with relations
    const dto = await this.employeeRepository.findOne({
      where: { id: savedEmployee.id },
      relations: ['account', 'supervisor', 'location'],
    });

    const employeeDto = plainToInstance(EmployeeDto, dto, {
      excludeExtraneousValues: true,
    });

    return CreatedResponse(employeeDto, 'Employee created successfully');
  }
}
