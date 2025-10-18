import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { ResetEmployeeViolationPointsCommand } from '../imp/reset-employee-violation-points.command';

@CommandHandler(ResetEmployeeViolationPointsCommand)
export class ResetEmployeeViolationPointsHandler
  extends BaseHandler<ResetEmployeeViolationPointsCommand, ApiResponseDto<null>>
  implements
    ICommandHandler<ResetEmployeeViolationPointsCommand, ApiResponseDto<null>>
{
  constructor(
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
  ) {
    super();
  }

  async handle(
    command: ResetEmployeeViolationPointsCommand,
  ): Promise<ApiResponseDto<null>> {
    const { employeeId } = command;

    // Find employee
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundHttpException('Employee not found');
    }

    // Reset violation points to 0
    await this.employeeRepository.update(employeeId, {
      violationPoints: 0,
    });

    return OkResponse(
      null,
      'Employee violation points have been reset to zero',
    );
  }
}
