import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { CreateViolationHandler } from './commands/handlers/create-violation.handler';
import { DeleteViolationHandler } from './commands/handlers/delete-violation.handler';
import { Violation } from './entities/violation.entity';
import { GetViolationHandler } from './queries/handlers/get-violation.handler';
import { GetViolationsHandler } from './queries/handlers/get-violations.handler';
import { ViolationsController } from './violations.controller';
import { Account } from '../identities/entities/account.entity';

const commandHandlers = [CreateViolationHandler, DeleteViolationHandler];

const queryHandlers = [GetViolationHandler, GetViolationsHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Violation, AccountEmployee, Account]),
    CqrsModule,
  ],
  controllers: [ViolationsController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class ViolationsModule {}
