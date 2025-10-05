/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager, In, Not } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { VisitActionResponseDto } from '../../dto/visit-action-response.dto';
import { VisitParticipant } from '../../entities/visit-participant.entity';
import { Visit } from '../../entities/visit.entity';
import { UpdateVisitCommand } from '../imp/update-visit.command';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { VisitGate } from '../../entities/visit-gate.entity';

@CommandHandler(UpdateVisitCommand)
export class UpdateVisitHandler
  extends BaseHandler<
    UpdateVisitCommand,
    ApiResponseDto<VisitActionResponseDto>
  >
  implements
    ICommandHandler<UpdateVisitCommand, ApiResponseDto<VisitActionResponseDto>>
{
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async handle(
    command: UpdateVisitCommand,
  ): Promise<ApiResponseDto<VisitActionResponseDto>> {
    const { id, updateVisitDto } = command;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accesses, visitParticipants, ...visitData } = updateVisitDto;

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const [visit, hostEmployee, company] = await Promise.all([
        manager.findOne(Visit, { where: { id } }),
        manager.findOne(AccountEmployee, {
          where: { id: visitData.hostEmployeeId },
        }),
        manager.findOne(Company, {
          where: { id: visitData.companyId },
        }),
      ]);

      if (!visit) {
        throw new NotFoundHttpException('Visit not found');
      } else if (!hostEmployee) {
        throw new NotFoundHttpException('Host employee not found');
      } else if (!company) {
        throw new NotFoundHttpException('Company not found');
      }

      const updatedVisit = await manager.update(Visit, id, visitData);

      // Optionally update visitParticipants separately here if needed
      if (visitParticipants?.length) {
        // Delete old participants not in the new list
        const deletePromise = manager.delete(VisitParticipant, {
          visitId: id,
          guestId: Not(In(visitParticipants)),
        });

        // Find existing participants to avoid duplicates
        const existingPromise = manager.find(VisitParticipant, {
          where: { visitId: id, guestId: In(visitParticipants) },
          select: ['guestId'],
        });

        const [_, existingParticipants] = await Promise.all([
          deletePromise,
          existingPromise,
        ]);

        const existingIds = existingParticipants.map((p) => p.guestId);
        const newIds = visitParticipants.filter(
          (pid) => !existingIds.includes(pid),
        );

        // Insert new participants
        if (newIds.length) {
          const insertParticipants = newIds.map((guestId) =>
            manager.create(VisitParticipant, { visitId: id, guestId }),
          );
          await manager.save(insertParticipants);
        }
      } else {
        // Delete all participants if the new list is empty
        await manager.delete(VisitParticipant, { visitId: id });
      }

      // Optionally update accesses separately here if needed
      if (accesses?.length) {
        // Delete old participants not in the new list
        const deletePromise = manager.delete(VisitGate, {
          visitId: id,
          gateId: Not(In(accesses)),
        });

        // Find existing participants to avoid duplicates
        const existingPromise = manager.find(VisitGate, {
          where: { visitId: id, gateId: In(accesses) },
          select: ['gateId'],
        });

        const [_, existingParticipants] = await Promise.all([
          deletePromise,
          existingPromise,
        ]);

        const existingIds = existingParticipants.map((p) => p.gateId);
        const newIds = accesses.filter((pid) => !existingIds.includes(pid));

        // Insert new participants
        if (newIds.length) {
          const insertParticipants = newIds.map((gateId) =>
            manager.create(VisitGate, { visitId: id, gateId }),
          );
          await manager.save(insertParticipants);
        }
      } else {
        // Delete all participants if the new list is empty
        await manager.delete(VisitGate, { visitId: id });
      }

      const visitDto = plainToInstance(VisitActionResponseDto, visit, {
        excludeExtraneousValues: true,
      });

      return OkResponse(visitDto, 'Visit updated successfully');
    });
  }
}
