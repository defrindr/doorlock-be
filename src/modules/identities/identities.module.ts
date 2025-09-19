import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Module } from '@nestjs/common';
import { GuestsModule } from './guests/guests.module';
import { AccountEmployee } from './entities/account-employee.entity';
import { AccountGuest } from './entities/account-guest.entity';
import { AccountIntern } from './entities/account-intern.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      AccountEmployee,
      AccountIntern,
      AccountGuest,
    ]),
    GuestsModule,
  ],
  controllers: [],
})
export class IdentitiesModule {}
