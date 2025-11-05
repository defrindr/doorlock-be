import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountEmployee } from '../entities/account-employee.entity';
import { Account } from '../entities/account.entity';
import { CreateEmployeeHandler } from './commands/handlers/create-employee.handler';
import { DeleteEmployeeHandler } from './commands/handlers/delete-employee.handler';
import { UpdateEmployeeHandler } from './commands/handlers/update-employee.handler';
import { EmployeesController } from './employees.controller';
import { GetEmployeeHandler } from './queries/handlers/get-employee.handler';
import { GetEmployeesHandler } from './queries/handlers/get-employees.handler';
import { EmployeeImageService } from './services/employee-image.service';
import { EmployeeExcelTemplateService } from './services/employee-excel-template.service';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { Location } from '@src/modules/master/locations/entities/location.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import { BulkInsertEmployeeHandler } from './commands/handlers/bulk-insert-employee.handler';
import { ResetEmployeeViolationPointsHandler } from './commands/handlers/reset-employee-violation-points.handler';
import { GateOccupant } from '@src/modules/histories/entities/gate-occupant.entity';

const commandHandlers = [
  CreateEmployeeHandler,
  UpdateEmployeeHandler,
  DeleteEmployeeHandler,
  BulkInsertEmployeeHandler,
  ResetEmployeeViolationPointsHandler,
];

const queryHandlers = [GetEmployeesHandler, GetEmployeeHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Company,
      Location,
      Gate,
      AccountEmployee,
      GateOccupant,
    ]),
    CqrsModule,
  ],
  controllers: [EmployeesController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    EmployeeImageService,
    EmployeeExcelTemplateService,
  ],
})
export class EmployeesModule {}
