import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { Violation } from '../../entities/violation.entity';
import { CreateViolationCommand } from '../imp/create-violation.command';
import { Account } from '@src/modules/identities/entities/account.entity';

@CommandHandler(CreateViolationCommand)
export class CreateViolationHandler
  extends BaseHandler<CreateViolationCommand, Violation>
  implements ICommandHandler<CreateViolationCommand, Violation>
{
  constructor(
    @InjectRepository(Violation)
    private readonly violationRepository: Repository<Violation>,
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {
    super();
  }

  async handle(command: CreateViolationCommand): Promise<Violation> {
    const { createViolationDto } = command;

    const [account, accountEmployee] = await Promise.all([
      this.accountRepository.findOne({
        where: {
          id: createViolationDto.employeeId,
        },
      }),
      this.employeeRepository.findOne({
        where: {
          accountId: createViolationDto.employeeId,
        },
      }),
    ]);

    if (!account || !accountEmployee) {
      throw new BadRequestHttpException("Employee doesnt' exists");
    }

    const pointBefore = accountEmployee.violationPoints || 0;
    const pointAfter = pointBefore - createViolationDto.pointMinus;

    const violation = this.violationRepository.create({
      employeeId: accountEmployee.id,
      pointBefore: pointBefore,
      pointMinus: createViolationDto.pointMinus,
      pointAfter: pointAfter,
      violationDate: new Date(createViolationDto.violationDate),
      violationDescription: createViolationDto.violationDescription,
    });

    accountEmployee.violationPoints = pointAfter;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [violationSaved, _] = await Promise.all([
      this.violationRepository.save(violation),
      this.employeeRepository.save(accountEmployee),
    ]);

    return violationSaved;
  }
}
