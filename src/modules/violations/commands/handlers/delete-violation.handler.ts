import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { DeleteViolationCommand } from '../imp/delete-violation.command';
import { Violation } from '../../entities/violation.entity';

@CommandHandler(DeleteViolationCommand)
export class DeleteViolationHandler
  extends BaseHandler<DeleteViolationCommand, void>
  implements ICommandHandler<DeleteViolationCommand, void>
{
  constructor(
    @InjectRepository(Violation)
    private readonly violationRepository: Repository<Violation>,
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

    await this.violationRepository.remove(violation);
  }
}
