import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AccountEmployee } from './entities/account-employee.entity';
import { AccountIntern } from './entities/account-intern.entity';
import { AccountGuest } from './entities/account-guest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      AccountEmployee,
      AccountIntern,
      AccountGuest,
    ]),
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class IdentityModule {}
