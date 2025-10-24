import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { Violation } from '../../entities/violation.entity';
import { MarkScannedViolationCommand } from '../imp/mark-scanned-violation.command';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';

@CommandHandler(MarkScannedViolationCommand)
export class MarkScannedViolationHandler
  extends BaseHandler<MarkScannedViolationCommand, Violation>
  implements ICommandHandler<MarkScannedViolationCommand, Violation>
{
  constructor(
    @InjectRepository(Violation)
    private readonly violationRepository: Repository<Violation>,
  ) {
    super();
  }

  async handle(command: MarkScannedViolationCommand): Promise<Violation> {
    const { id } = command;

    const violation = await this.violationRepository.findOne({
      where: { id: id },
    });
    if (!violation) throw new NotFoundHttpException('Violation data not found');

    violation.scannedAt = new Date();
    const violationSaved = await this.violationRepository.save(violation);

    return violationSaved;
  }
}
