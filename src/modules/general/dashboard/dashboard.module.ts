import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from '@src/modules/histories/entities/history.entity';
import { DashboardController } from './dashboard.controller';
import { GetDashboardHandler } from './queries/handlers/get-dashboard.handler';

const commandHandlers: any = [];

const queryHandlers = [GetDashboardHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEmployee, Gate, History]),
    CqrsModule,
  ],
  controllers: [DashboardController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class DashboardModule {}
