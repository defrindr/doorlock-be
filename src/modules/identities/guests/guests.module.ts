import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { AccountGuest } from '../entities/account-guest.entity';
import { Account } from '../entities/account.entity';
import { CreateGuestHandler } from './commands/handlers/create-guest.handler';
import { DeleteGuestHandler } from './commands/handlers/delete-guest.handler';
import { UpdateGuestHandler } from './commands/handlers/update-guest.handler';
import { GuestsController } from './guests.controller';
import { GetGuestHandler } from './queries/handlers/get-guest.handler';
import { GetGuestsByCompanyHandler } from './queries/handlers/get-guests-by-company.handler';
import { GetGuestsHandler } from './queries/handlers/get-guests.handler';
import { GuestImageService } from './services/guest-image.service';
import { GateOccupant } from '@src/modules/histories/entities/gate-occupant.entity';

const commandHandlers = [
  CreateGuestHandler,
  UpdateGuestHandler,
  DeleteGuestHandler,
];

const queryHandlers = [
  GetGuestsHandler,
  GetGuestHandler,
  GetGuestsByCompanyHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, AccountGuest, Company, GateOccupant]),
    CqrsModule,
  ],
  controllers: [GuestsController],
  providers: [...commandHandlers, ...queryHandlers, GuestImageService],
})
export class GuestsModule {}
