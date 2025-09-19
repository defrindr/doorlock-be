import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCompanyHandler } from './commands/handlers/create-company.handler';
import { DeleteCompanyHandler } from './commands/handlers/delete-company.handler';
import { UpdateCompanyHandler } from './commands/handlers/update-company.handler';
import { Company } from './entities/company.entity';
import { CompaniesController } from './companies.controller';
import { GetCompanyHandler } from './queries/handlers/get-company.handler';
import { GetCompaniesHandler } from './queries/handlers/get-companies.handler';

const commandHandlers = [
  CreateCompanyHandler,
  UpdateCompanyHandler,
  DeleteCompanyHandler,
];

const queryHandlers = [GetCompaniesHandler, GetCompanyHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Company]), CqrsModule],
  controllers: [CompaniesController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class CompaniesModule {}
