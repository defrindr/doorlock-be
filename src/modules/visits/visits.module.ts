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

const commandHandlers = [
  CreateVisitHandler,
  UpdateVisitHandler,
  DeleteVisitHandler,
];

const queryHandlers = [GetVisitsHandler, GetVisitHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Visit]), CqrsModule],
  controllers: [VisitsController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class VisitsModule {}
