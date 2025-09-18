import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { Gate } from '../../entities/gate.entity';
import { DeleteGateCommand } from '../imp/delete-gate.command';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';

@CommandHandler(DeleteGateCommand)
export class DeleteGateHandler
  extends BaseHandler<DeleteGateCommand, ApiResponseDto<null>>
  implements ICommandHandler<DeleteGateCommand, ApiResponseDto<null>>
{
  constructor(
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
  ) {
    super();
  }

  async handle(command: DeleteGateCommand): Promise<ApiResponseDto<null>> {
    const { id } = command;

    // Find existing gate
    const gate = await this.gateRepository.findOne({
      where: { id },
    });

    if (!gate) {
      throw new NotFoundHttpException(`Gate with ID ${id} not found`);
    }

    // Soft delete the gate
    await this.gateRepository.softDelete(id);

    return OkResponse(null, 'Gate deleted successfully');
  }
}
