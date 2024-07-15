import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { IamModule } from './modules/iam/auth.module';

@Module({
  imports: [IamModule, DbModule],
})
export class AppModule {}
