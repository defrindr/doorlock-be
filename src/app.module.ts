import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core/constants';
import { DbModule } from './db/db.module';
import { DashboardModule } from './modules/general/dashboard/dashboard.module';
import { HistoriesModule } from './modules/histories/histories.module';
import { IamModule } from './modules/iam/iam.module';
import { IdentitiesModule } from './modules/identities/identities.module';
import { MasterModule } from './modules/master/master.module';
import { NfcsModule } from './modules/nfcs/nfcs.module';
import { VisitsModule } from './modules/visits/visits.module';
import { JwtAuthGuard } from './shared/core/guards/jwt-auth.guard';
import { UserContextMiddleware } from './shared/storage/user-context.middleware';

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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserContextMiddleware).forRoutes('*');
  }
}
