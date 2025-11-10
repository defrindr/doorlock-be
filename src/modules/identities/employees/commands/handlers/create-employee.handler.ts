import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager } from 'typeorm';

import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { AccountType } from '@src/modules/identities/entities/account-type.enum';
import { Account } from '@src/modules/identities/entities/account.entity';
import { EmployeeGate } from '@src/modules/identities/entities/employee-gates.entity';
import { EmployeeDto } from '../../dto/employee.dto';
import { EmployeeImageService } from '../../services/employee-image.service';
import { CreateEmployeeCommand } from '../imp/create-employee.command';

@CommandHandler(CreateEmployeeCommand)
export class CreateEmployeeHandler
  extends BaseHandler<CreateEmployeeCommand, ApiResponseDto<EmployeeDto>>
  implements ICommandHandler<CreateEmployeeCommand, ApiResponseDto<EmployeeDto>>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly employeeImageService: EmployeeImageService,
  ) {
    super();
  }

  async handle(
    command: CreateEmployeeCommand,
  ): Promise<ApiResponseDto<EmployeeDto>> {
    const { createEmployeeDto } = command;

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Validate employee number uniqueness
      const existingEmployee = await manager.findOne(AccountEmployee, {
        where: { employeeNumber: createEmployeeDto.employeeNumber },
      });

      if (existingEmployee) {
        throw new BadRequestHttpException(
          'Employee number already exists in the system',
        );
      }

      // Handle photo upload if provided
      const photoPath = await this.employeeImageService.handlePhotoUpload(
        createEmployeeDto.photo,
      );

      // Extract account-related fields
      const { status, nfcCode, ...employeeData } = createEmployeeDto;

      // Create Account
      const account = manager.create(Account, {
        accountType: AccountType.EMPLOYEE,
        photo: photoPath,
        status: status ?? 1,
        nfcCode: nfcCode,
      });

      const savedAccount = await manager.save(Account, account);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { accesses, photo, ...employeDataFinal } = employeeData;
      // Create Employee
      const employee = manager.create(AccountEmployee, {
        ...employeDataFinal,
        accountId: savedAccount.id,
        violationPoints: createEmployeeDto.violationPoints ?? 5,
        certification: JSON.stringify(createEmployeeDto?.certification || []),
      });

      const savedEmployee = await manager.save(AccountEmployee, employee);

      if (accesses) {
        await manager.save(
          EmployeeGate,
          accesses.map((gateId: string) => {
            return manager.create(EmployeeGate, {
              gateId,
              employeeId: savedEmployee.id,
            });
          }),
        );
      }

      // Fetch complete data with relations
      const dto = await manager.findOne(AccountEmployee, {
        where: { id: savedEmployee.id },
        relations: ['account', 'supervisor', 'location', 'company'],
      });

      const employeeDto = plainToInstance(EmployeeDto, dto, {
        excludeExtraneousValues: true,
      });

      return CreatedResponse(employeeDto, 'Employee created successfully');
    });
  }
}
