import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import {
  BadRequestHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { Account } from '@src/modules/identities/entities/account.entity';
import { UpdateEmployeeCommand } from '../imp/update-employee.command';
import { EmployeeDto } from '../../dto/employee.dto';

@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler
  extends BaseHandler<UpdateEmployeeCommand, ApiResponseDto<EmployeeDto>>
  implements ICommandHandler<UpdateEmployeeCommand, ApiResponseDto<EmployeeDto>>
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
    command: UpdateEmployeeCommand,
  ): Promise<ApiResponseDto<EmployeeDto>> {
    const { id, updateEmployeeDto } = command;

    // Find employee
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!employee) {
      throw new NotFoundHttpException('Employee not found');
    }

    // Check employee number uniqueness if it's being updated
    if (
      updateEmployeeDto.employeeNumber &&
      updateEmployeeDto.employeeNumber !== employee.employeeNumber
    ) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { employeeNumber: updateEmployeeDto.employeeNumber },
      });

      if (existingEmployee) {
        throw new BadRequestHttpException(
          'Employee number already exists in the system',
        );
      }
    }

    // Extract account-related fields
    const { photo, status, nfcCode, ...employeeData } = updateEmployeeDto;

    // Update account if account-related fields are provided
    if (photo !== undefined || status !== undefined || nfcCode !== undefined) {
      const accountUpdate: Partial<Account> = {};
      if (photo !== undefined) accountUpdate.photo = photo;
      if (status !== undefined) accountUpdate.status = status;
      if (nfcCode !== undefined) accountUpdate.nfcCode = nfcCode;

      await this.accountRepository.update(employee.accountId, accountUpdate);
    }

    // Update employee
    await this.employeeRepository.update(id, employeeData);

    // Fetch updated data
    const updatedEmployee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['account', 'supervisor', 'location'],
    });

    const employeeDto = plainToInstance(EmployeeDto, updatedEmployee, {
      excludeExtraneousValues: true,
    });

    return OkResponse(employeeDto, 'Employee updated successfully');
  }
}
