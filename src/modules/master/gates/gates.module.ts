import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatesController } from './gates.controller';
import { Gate } from './entities/gate.entity';
import { Location } from '@src/modules/master/locations/entities/location.entity';

// Command Handlers
import { CreateGateHandler } from './commands/handlers/create-gate.handler';
import { UpdateGateHandler } from './commands/handlers/update-gate.handler';
import { DeleteGateHandler } from './commands/handlers/delete-gate.handler';

// Query Handlers
import { GetGateHandler } from './queries/handlers/get-gate.handler';
import { GetPortableGatesHandler } from './queries/handlers/get-portable-gates.handler';
import { GetGatesHandler } from './queries/handlers/get-gates.handler';

const CommandHandlers = [
  CreateGateHandler,
  UpdateGateHandler,
  DeleteGateHandler,
];

const QueryHandlers = [
  GetPortableGatesHandler,
  GetGateHandler,
  GetGatesHandler,
];

@Module({
  imports: [TypeOrmModule.forFeature([Gate, Location]), CqrsModule],
  controllers: [GatesController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class GatesModule {}
