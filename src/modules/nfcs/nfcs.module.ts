import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nfc } from './entities/nfc.entity';
import { NfcsController } from './nfcs.controller';
import { GetNfcHandler } from './queries/handlers/get-nfc.handler';
import { PrepareDataService } from './services/prepare-data.service';
import { UnassignNfcHandler } from './commands/handlers/unassign-nfc.handler';

const commandHandlers = [UnassignNfcHandler];
const queryHandlers = [GetNfcHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Nfc]), CqrsModule],
  controllers: [NfcsController],
  providers: [...commandHandlers, ...queryHandlers, PrepareDataService],
})
export class NfcsModule {}
