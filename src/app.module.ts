import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { IamModule } from './modules/iam/iam.module';
import { IdentitiesModule } from './modules/identities/identities.module';
import { MasterModule } from './modules/master/master.module';
import { VisitsModule } from './modules/visits/visits.module';
import { NfcModule } from './modules/nfc';
import { HistoriesModule } from './modules/histories/histories.module';

@Module({
  imports: [
    IamModule,
    DbModule,
    MasterModule,
    IdentitiesModule,
    VisitsModule,
    NfcModule,
    HistoriesModule,
  ],
})
export class AppModule {}
