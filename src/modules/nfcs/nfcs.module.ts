import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nfc } from './entities/nfc.entity';
import { NfcsController } from './nfcs.controller';
import { GetNfcHandler } from './queries/handlers/get-nfc.handler';
import { PrepareDataService } from './services/prepare-data.service';

const queryHandlers = [GetNfcHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Nfc]), CqrsModule],
  controllers: [NfcsController],
  providers: [...queryHandlers, PrepareDataService],
})
export class NfcsModule {}
