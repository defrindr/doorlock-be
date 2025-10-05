import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateVisitHandler } from './commands/handlers/create-visit.handler';
import { DeleteVisitHandler } from './commands/handlers/delete-visit.handler';
import { UpdateVisitHandler } from './commands/handlers/update-visit.handler';
import { Visit } from './entities/visit.entity';
import { VisitsController } from './visits.controller';
import { GetVisitHandler } from './queries/handlers/get-visit.handler';
import { GetVisitsHandler } from './queries/handlers/get-visits.handler';
import { SyncParticipantGatesHandler } from './commands/handlers/sync-participant-gates.handler';
import { VisitGuestGate } from './entities/visit-guest-gate.entity';
import { VisitParticipant } from './entities/visit-participant.entity';

const commandHandlers = [
  CreateVisitHandler,
  UpdateVisitHandler,
  DeleteVisitHandler,
  SyncParticipantGatesHandler,
];

const queryHandlers = [GetVisitsHandler, GetVisitHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Visit, VisitGuestGate, VisitParticipant]),
    CqrsModule,
  ],
  controllers: [VisitsController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class VisitsModule {}
