import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { VisitDto } from '../../dto/visit.dto';
import { Visit } from '../../entities/visit.entity';
import { GetVisitQuery } from '../imp/get-visit.query';

@QueryHandler(GetVisitQuery)
export class GetVisitHandler
  extends BaseHandler<GetVisitQuery, ApiResponseDto<VisitDto>>
  implements IQueryHandler<GetVisitQuery, ApiResponseDto<VisitDto>>
{
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
  ) {
    super();
  }

  async handle(query: GetVisitQuery): Promise<ApiResponseDto<VisitDto>> {
    const { id } = query;
    const qb = await this.visitRepository
      .createQueryBuilder('visit')
      .leftJoinAndSelect('visit.company', 'company')
      .leftJoinAndSelect('visit.hostEmployee', 'hostEmployee')
      .leftJoinAndSelect('visit.visitParticipants', 'visitParticipants')
      .leftJoinAndSelect('visitParticipants.guest', 'guest')
      .leftJoinAndSelect('guest.account', 'guestAccount')
      .leftJoinAndSelect('visit.visitGates', 'visitGates')
      .leftJoinAndSelect('visitGates.gate', 'gate')
      .where('visit.id = :id', { id });

    // console.log(qb.getSql()); // 👈 prints the SQL
    const visit = await qb.getOne();

    // const visit = await this.visitRepository.findOne({
    //   where: { id },
    //   relations: [
    //     'company',
    //     'hostEmployee',
    //     'visitParticipants',
    //     'visitParticipants.guest',
    //     'visitParticipants.guest.account',
    //     'visitGates',
    //     'visitGates.gate',
    //   ],
    // });

    if (!visit) {
      throw new NotFoundHttpException('Visit not found');
    }

    // console.log(visit);

    const participants =
      visit?.visitParticipants?.map((item) => {
        const { account, ...guest } = item.guest;
        return { ...guest, photoUrl: account.photo };
      }) || [];
    const accesses =
      visit?.visitGates?.map((item) => {
        const { ...gate } = item.gate;
        return { ...gate };
      }) || [];

    delete visit.visitParticipants;
    delete visit.visitGates;

    const visitDto = plainToInstance(
      VisitDto,
      {
        ...visit,
        participants,
        accesses,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    return OkResponse(visitDto, 'Visit retrieved successfully');
  }
}
