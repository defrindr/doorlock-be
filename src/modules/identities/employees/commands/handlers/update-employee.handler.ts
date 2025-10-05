import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager, In, Not } from 'typeorm';

import {
  BadRequestHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { Account } from '@src/modules/identities/entities/account.entity';
import { EmployeeGate } from '@src/modules/identities/entities/employee-gates.entity';
import { EmployeeDto } from '../../dto/employee.dto';
import { EmployeeImageService } from '../../services/employee-image.service';
import { UpdateEmployeeCommand } from '../imp/update-employee.command';

@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler
  extends BaseHandler<UpdateEmployeeCommand, ApiResponseDto<EmployeeDto>>
  implements ICommandHandler<UpdateEmployeeCommand, ApiResponseDto<EmployeeDto>>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly employeeImageService: EmployeeImageService,
  ) {
    super();
  }

  async handle(
    command: UpdateEmployeeCommand,
  ): Promise<ApiResponseDto<EmployeeDto>> {
    const { id, updateEmployeeDto } = command;

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Find employee
      const employee = await manager.findOne(AccountEmployee, {
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
        const existingEmployee = await manager.findOne(AccountEmployee, {
          where: { employeeNumber: updateEmployeeDto.employeeNumber },
        });

        if (existingEmployee) {
          throw new BadRequestHttpException(
            'Employee number already exists in the system',
          );
        }
      }

      // Check Account Data
      const account = await manager.findOne(Account, {
        where: { id: employee.accountId },
      });
      if (!account) {
        throw new NotFoundHttpException('Account not found');
      }

      // Handle photo update if provided
      const photoPath = await this.employeeImageService.handlePhotoUpdate(
        updateEmployeeDto.photo,
        account?.photo ?? undefined,
      );

      // Extract account-related fields
      const { status, nfcCode, ...employeeData } = updateEmployeeDto;

      // Update account if account-related fields are provided
      if (
        photoPath !== undefined ||
        status !== undefined ||
        nfcCode !== undefined
      ) {
        const accountUpdate: Partial<Account> = {};
        if (photoPath !== undefined) accountUpdate.photo = photoPath;
        if (status !== undefined) accountUpdate.status = status;
        if (nfcCode !== undefined) accountUpdate.nfcCode = nfcCode;

        await manager.update(Account, employee.accountId, accountUpdate);
      }

      // Update employee
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { accesses, photo, ...employeeFinal } = employeeData;
      await manager.update(AccountEmployee, id, {
        ...employeeFinal,
        violationPoints: employeeData?.violationPoints ?? 0,
        certification: JSON.stringify(employeeFinal?.certification || []),
      });

      // Optionally update accesses separately here if needed
      if (accesses?.length) {
        // Delete old participants not in the new list
        const deletePromise = manager.delete(EmployeeGate, {
          employeeId: id,
          gateId: Not(In(accesses)),
        });

        // Find existing participants to avoid duplicates
        const existingPromise = manager.find(EmployeeGate, {
          where: { employeeId: id, gateId: In(accesses) },
          select: ['gateId'],
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, existingParticipants] = await Promise.all([
          deletePromise,
          existingPromise,
        ]);

        const existingIds = existingParticipants.map((p) => p.gateId);
        const newIds = accesses.filter((pid) => !existingIds.includes(pid));

        // Insert new participants
        if (newIds.length) {
          const insertParticipants = newIds.map((gateId) =>
            manager.create(EmployeeGate, { employeeId: id, gateId }),
          );
          await manager.save(insertParticipants);
        }
      } else {
        // Delete all participants if the new list is empty
        await manager.delete(EmployeeGate, { employeeId: id });
      }

      // Fetch updated data
      const updatedEmployee = await manager.findOne(AccountEmployee, {
        where: { id },
        relations: ['account', 'supervisor', 'location', 'company'],
      });

      const employeeDto = plainToInstance(EmployeeDto, updatedEmployee, {
        excludeExtraneousValues: true,
      });

      return OkResponse(employeeDto, 'Employee updated successfully');
    });
  }
}
