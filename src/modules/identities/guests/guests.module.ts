import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountGuest } from '../entities/account-guest.entity';
import { CreateGuestHandler } from './commands/handlers/create-guest.handler';
import { DeleteGuestHandler } from './commands/handlers/delete-guest.handler';
import { UpdateGuestHandler } from './commands/handlers/update-guest.handler';
import { GuestsController } from './guests.controller';
import { GetGuestHandler } from './queries/handlers/get-guest.handler';
import { GetGuestsHandler } from './queries/handlers/get-guests.handler';
import { Account } from '../entities/account.entity';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { GuestImageService } from './services/guest-image.service';

const commandHandlers = [
  CreateGuestHandler,
  UpdateGuestHandler,
  DeleteGuestHandler,
];

const queryHandlers = [GetGuestsHandler, GetGuestHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, AccountGuest, Company]),
    CqrsModule,
  ],
  controllers: [GuestsController],
  providers: [...commandHandlers, ...queryHandlers, GuestImageService],
})
export class GuestsModule {}
