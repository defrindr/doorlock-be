import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { VisitDto } from '../../dto/visit.dto';
import { Visit } from '../../entities/visit.entity';
import { UpdateVisitCommand } from '../imp/update-visit.command';

@CommandHandler(UpdateVisitCommand)
export class UpdateVisitHandler
  extends BaseHandler<UpdateVisitCommand, ApiResponseDto<VisitDto>>
  implements ICommandHandler<UpdateVisitCommand, ApiResponseDto<VisitDto>>
{
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
  ) {
    super();
  }

  async handle(command: UpdateVisitCommand): Promise<ApiResponseDto<VisitDto>> {
    const { id, updateVisitDto } = command;
    // Remove visitParticipants from update payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { visitParticipants, ...visitData } = updateVisitDto;

    const [visit] = await Promise.all([
      this.visitRepository.findOne({ where: { id } }),
    ]);

    if (!visit) {
      throw new NotFoundHttpException('Visit not found');
    }

    await this.visitRepository.update(id, visitData);

    // Optionally update visitParticipants separately here if needed

    const updatedVisit = await this.visitRepository.findOne({
      where: { id },
    });

    const visitDto = plainToInstance(VisitDto, updatedVisit, {
      excludeExtraneousValues: true,
    });

    return OkResponse(visitDto, 'Visit updated successfully');
  }
}
