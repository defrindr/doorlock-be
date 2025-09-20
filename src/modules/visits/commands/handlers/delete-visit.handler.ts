import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { Visit } from '../../entities/visit.entity';
import { DeleteVisitCommand } from '../imp/delete-visit.command';

@CommandHandler(DeleteVisitCommand)
export class DeleteVisitHandler
  extends BaseHandler<DeleteVisitCommand, ApiResponseDto<null>>
  implements ICommandHandler<DeleteVisitCommand, ApiResponseDto<null>>
{
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
  ) {
    super();
  }

  async handle(command: DeleteVisitCommand): Promise<ApiResponseDto<null>> {
    const { id } = command;

    const visit = await this.visitRepository.findOne({
      where: { id },
    });

    if (!visit) {
      throw new NotFoundHttpException('Visit not found');
    }

    await this.visitRepository.softDelete(id);

    return OkResponse(null, 'Visit deleted successfully');
  }
}
