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
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { BulkInsertEmployeeHandler } from './commands/handlers/bulk-insert-employee.handler';

const commandHandlers = [
  CreateEmployeeHandler,
  UpdateEmployeeHandler,
  DeleteEmployeeHandler,
  BulkInsertEmployeeHandler,
];

const queryHandlers = [GetEmployeesHandler, GetEmployeeHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Company, AccountEmployee]),
    CqrsModule,
  ],
  controllers: [EmployeesController],
  providers: [...commandHandlers, ...queryHandlers, EmployeeImageService],
})
export class EmployeesModule {}
