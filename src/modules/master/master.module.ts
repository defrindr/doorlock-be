import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { GatesModule } from './gates/gates.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [LocationsModule, GatesModule, CompaniesModule],
})
export class MasterModule {}
