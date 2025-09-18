import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { IamModule } from './modules/iam/iam.module';
import { LocationsModule } from './modules/locations/locations.module';

@Module({
  imports: [IamModule, DbModule, LocationsModule],
})
export class AppModule {}
