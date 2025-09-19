import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { IamModule } from './modules/iam/iam.module';
import { IdentitiesModule } from './modules/identities/identities.module';
import { MasterModule } from './modules/master/master.module';

@Module({
  imports: [IamModule, DbModule, MasterModule, IdentitiesModule],
})
export class AppModule {}
