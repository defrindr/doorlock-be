import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { VisitGuestGate } from '@src/modules/visits/entities/visit-guest-gate.entity';
import { SyncParticipantGatesCommand } from '../imp/sync-participant-gates.command';
import { VisitParticipant } from '../../entities/visit-participant.entity';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';

@CommandHandler(SyncParticipantGatesCommand)
export class SyncParticipantGatesHandler
  extends BaseHandler<SyncParticipantGatesCommand, ApiResponseDto<null>>
  implements ICommandHandler<SyncParticipantGatesCommand, ApiResponseDto<null>>
{
  constructor(
    @InjectRepository(VisitGuestGate)
    private readonly visitGuestGateRepository: Repository<VisitGuestGate>,
    @InjectRepository(VisitParticipant)
    private readonly visitParticipantRepository: Repository<VisitParticipant>,
  ) {
    super();
  }

  async handle(
    command: SyncParticipantGatesCommand,
  ): Promise<ApiResponseDto<null>> {
    const { visitId, visitParticipantId, syncGatesDto } = command;

    const visitParticipant = await this.visitParticipantRepository.findOne({
      where: {
        visitId,
        guestId: visitParticipantId,
      },
    });

    if (!visitParticipant)
      throw new BadRequestHttpException('visitParticipant not found');

    // Get current gate assignments for this participant
    const currentAssignments = await this.visitGuestGateRepository.find({
      where: { visitGuestId: visitParticipant?.id },
    });

    const currentGateIds = currentAssignments.map(
      (assignment) => assignment.gateId,
    );
    const requestedGateIds = syncGatesDto.gateIds;

    // Find gates to add (in request but not in DB)
    const gatesToAdd = requestedGateIds.filter(
      (gateId) => !currentGateIds.includes(gateId),
    );

    // Find gates to remove (in DB but not in request)
    const gatesToRemove = currentGateIds.filter(
      (gateId) => !requestedGateIds.includes(gateId),
    );

    // Add new gate assignments
    if (gatesToAdd.length > 0) {
      const newAssignments = gatesToAdd.map((gateId) => ({
        visitGuestId: visitParticipant.id,
        gateId,
      }));

      await this.visitGuestGateRepository.save(newAssignments);
    }

    // Remove old gate assignments
    if (gatesToRemove.length > 0) {
      await this.visitGuestGateRepository
        .createQueryBuilder()
        .delete()
        .from(VisitGuestGate)
        .where('visitGuestId = :visitParticipantId', {
          visitParticipantId: visitParticipant.id,
        })
        .andWhere('gateId IN (:...gatesToRemove)', { gatesToRemove })
        .execute();
    }

    return OkResponse(null, 'Participant gates synchronized successfully');
  }
}
