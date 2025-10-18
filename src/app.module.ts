import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core/constants';
import { DbModule } from './db/db.module';
import { HistoriesModule } from './modules/histories/histories.module';
import { IamModule } from './modules/iam/iam.module';
import { IdentitiesModule } from './modules/identities/identities.module';
import { MasterModule } from './modules/master/master.module';
import { NfcsModule } from './modules/nfcs/nfcs.module';
import { VisitsModule } from './modules/visits/visits.module';
import { JwtAuthGuard } from './shared/core/guards/jwt-auth.guard';
import { DashboardModule } from './modules/general/dashboard/dashboard.module';

@Module({
  imports: [
    DashboardModule,
    IamModule,
    DbModule,
    MasterModule,
    IdentitiesModule,
    VisitsModule,
    HistoriesModule,
    NfcsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
