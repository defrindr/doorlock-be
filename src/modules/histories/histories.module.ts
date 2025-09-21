import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './entities/history.entity';
import { HistoriesController } from './histories.controller';
import { GetHistoriesHandler } from './queries/handlers/get-histories.handler';
import { SyncHistoryHandler } from './commands/handlers/sync-history.handler';
import { Account } from '../identities/entities/account.entity';
import { Gate } from '../master/gates/entities/gate.entity';
import { AccountGuest } from '../identities/entities/account-guest.entity';
import { AccountEmployee } from '../identities/entities/account-employee.entity';
import { AccountIntern } from '../identities/entities/account-intern.entity';

const commandHandlers = [SyncHistoryHandler];

const queryHandlers = [GetHistoriesHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      History,
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
