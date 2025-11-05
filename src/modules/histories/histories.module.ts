import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { GateOccupant } from './entities/gate-occupant.entity';
import { HistoriesController } from './histories.controller';
import { GetHistoriesHandler } from './queries/handlers/get-histories.handler';
import { ExportHistoriesHandler } from './queries/handlers/export-histories.handler';
import { SyncHistoryHandler } from './commands/handlers/sync-history.handler';
import { Account } from '../identities/entities/account.entity';
import { Gate } from '../master/gates/entities/gate.entity';
import { AccountGuest } from '../identities/entities/account-guest.entity';
import { AccountEmployee } from '../identities/entities/account-employee.entity';
import { AccountIntern } from '../identities/entities/account-intern.entity';
import { GetLatestHistoriesHandler } from './queries/handlers/get-latest-histories.handler';

const commandHandlers = [SyncHistoryHandler];

const queryHandlers = [
  GetHistoriesHandler,
  ExportHistoriesHandler,
  GetLatestHistoriesHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      History,
      GateOccupant,
      Account,
      AccountGuest,
      AccountEmployee,
      AccountIntern,
      Gate,
    ]),
    CqrsModule,
  ],
  controllers: [HistoriesController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class HistoriesModule {}
