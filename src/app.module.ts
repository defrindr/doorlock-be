import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { IamModule } from './modules/iam/iam.module';
import { LocationsModule } from './modules/locations/locations.module';
import { GatesModule } from './modules/gates/gates.module';
import { IdentityModule } from './modules/identity/identity.module';
import { CompaniesModule } from './modules/companies/companies.module';

@Module({
  imports: [
    IamModule,
    DbModule,
    LocationsModule,
    GatesModule,
    IdentityModule,
    CompaniesModule,
  ],
})
export class AppModule {}
