import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { IamModule } from './modules/iam/iam.module';
import { IdentitiesModule } from './modules/identities/identities.module';
import { MasterModule } from './modules/master/master.module';
import { VisitsModule } from './modules/visits/visits.module';
import { HistoriesModule } from './modules/histories/histories.module';
import { APP_GUARD } from '@nestjs/core/constants';
import { JwtAuthGuard } from './shared/core/guards/jwt-auth.guard';
import { NfcModule } from './modules/nfc/nfc.module';

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
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
