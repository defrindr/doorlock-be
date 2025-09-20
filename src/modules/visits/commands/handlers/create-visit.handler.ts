import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource, EntityManager, In } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import {
  BadRequestHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { VisitActionResponseDto } from '../../dto/visit-action-response.dto';
import { VisitParticipant } from '../../entities/visit-participant.entity';
import { Visit } from '../../entities/visit.entity';
import { CreateVisitCommand } from '../imp/create-visit.command';

@CommandHandler(CreateVisitCommand)
export class CreateVisitHandler
  extends BaseHandler<
    CreateVisitCommand,
    ApiResponseDto<VisitActionResponseDto>
  >
  implements
    ICommandHandler<CreateVisitCommand, ApiResponseDto<VisitActionResponseDto>>
{
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async handle(
    command: CreateVisitCommand,
  ): Promise<ApiResponseDto<VisitActionResponseDto>> {
    const { createVisitDto } = command;

    try {
      // Prepare fields
      const { visitParticipants, ...visitData } = createVisitDto;
      const participantIds = visitParticipants;

      return await this.dataSource.transaction(
        async (manager: EntityManager) => {
          // Validate data
          console.log(visitData.hostEmployeeId);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [_employeeValid, _companyValid, participants] =
            await Promise.all([
              createVisitDto.hostEmployeeId
                ? manager
                    .findOne(AccountEmployee, {
                      where: { id: createVisitDto.hostEmployeeId },
                    })
                    .then((res) => {
                      if (!res) {
                        throw new NotFoundHttpException(
                          `Host Employee doesn't exists`,
                        );
                      }
                    })
                : Promise.resolve(),
              manager
                .findOne(Company, {
                  where: {
                    id: createVisitDto.companyId,
                    status: 1,
                  },
                })
                .then((res) => {
                  if (!res) {
                    throw new NotFoundHttpException(
                      `Company doesn't exist or active`,
                    );
                  }
                }),
              participantIds
                ? manager
                    .find(AccountGuest, { where: { id: In(participantIds) } })
                    .then((participants) => {
                      const dbParticipantIds = participants.map((p) => p.id);
                      if (participantIds?.length !== dbParticipantIds.length) {
                        throw new BadRequestHttpException(
                          `You have invalid data in list of participants`,
                        );
                      }

                      return participants;
                    })
                : Promise.resolve(),
            ]);
          // Create visit data
          const visit = manager.create(Visit, visitData);
          const savedVisit = await manager.save(visit);

          // Create visit participant data
          if (participantIds) {
            const visitParticipants = participantIds.map((participantId) => {
              return manager.create(VisitParticipant, {
                visit: savedVisit,
                guest: { id: participantId },
              });
            });
            await manager.save(visitParticipants);
          }

          const visitDto = plainToInstance(VisitActionResponseDto, savedVisit, {
            excludeExtraneousValues: true,
          });

          return CreatedResponse(visitDto, 'Visit created successfully');
        },
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
