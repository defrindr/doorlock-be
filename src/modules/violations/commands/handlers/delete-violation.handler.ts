import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { DeleteViolationCommand } from '../imp/delete-violation.command';
import { Violation } from '../../entities/violation.entity';
import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';

@CommandHandler(DeleteViolationCommand)
export class DeleteViolationHandler
  extends BaseHandler<DeleteViolationCommand, void>
  implements ICommandHandler<DeleteViolationCommand, void>
{
  constructor(
    @InjectRepository(Violation)
    private readonly violationRepository: Repository<Violation>,
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
  ) {
    super();
  }

  async handle(command: DeleteViolationCommand): Promise<void> {
    const { id } = command;

    const violation = await this.violationRepository.findOne({
      where: { id },
    });

    if (!violation) {
      throw new Error('Violation not found');
    }

    if (violation.scannedAt !== null) {
      const employee = await this.employeeRepository.findOne({
        where: { id: violation.employeeId },
      });

      if (employee) {
        employee.violationPoints += violation.pointMinus;
        await this.employeeRepository.save(employee);
      }
    }

    await this.violationRepository.remove(violation);
  }
}
