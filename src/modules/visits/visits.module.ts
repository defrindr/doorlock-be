import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateVisitHandler } from './commands/handlers/create-visit.handler';
import { DeleteVisitHandler } from './commands/handlers/delete-visit.handler';
import { ImportVisitHandler } from './commands/handlers/import-visit.handler';
import { SyncParticipantGatesHandler } from './commands/handlers/sync-participant-gates.handler';
import { UpdateVisitHandler } from './commands/handlers/update-visit.handler';
import { VisitGuestGate } from './entities/visit-guest-gate.entity';
import { VisitParticipant } from './entities/visit-participant.entity';
import { Visit } from './entities/visit.entity';
import { GetVisitHandler } from './queries/handlers/get-visit.handler';
import { GetVisitsHandler } from './queries/handlers/get-visits.handler';
import { VisitExcelTemplateService } from './services/visit-excel-template.service';
import { VisitsController } from './visits.controller';
import { Company } from '../master/companies/entities/company.entity';
import { Gate } from '../master/gates/entities/gate.entity';

const commandHandlers = [
  CreateVisitHandler,
  UpdateVisitHandler,
  DeleteVisitHandler,
  ImportVisitHandler,
  SyncParticipantGatesHandler,
];

const queryHandlers = [GetVisitsHandler, GetVisitHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Visit,
      VisitGuestGate,
      VisitParticipant,
      Company,
      Gate,
    ]),
    CqrsModule,
  ],
  controllers: [VisitsController],
  providers: [...commandHandlers, ...queryHandlers, VisitExcelTemplateService],
})
export class VisitsModule {}
