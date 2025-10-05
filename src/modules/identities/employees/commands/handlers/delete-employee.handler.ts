import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { DeletedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { Account } from '@src/modules/identities/entities/account.entity';
import { DeleteEmployeeCommand } from '../imp/delete-employee.command';

@CommandHandler(DeleteEmployeeCommand)
export class DeleteEmployeeHandler
  extends BaseHandler<DeleteEmployeeCommand, ApiResponseDto<null>>
  implements ICommandHandler<DeleteEmployeeCommand, ApiResponseDto<null>>
{
  constructor(
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {
    super();
  }

  async handle(command: DeleteEmployeeCommand): Promise<ApiResponseDto<null>> {
    const { id } = command;

    // Find employee
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!employee) {
      throw new NotFoundHttpException('Employee not found');
    }

    // Soft delete employee (cascade will handle account deletion)
    await this.employeeRepository.softDelete(id);

    return DeletedResponse('Employee deleted successfully');
  }
}
