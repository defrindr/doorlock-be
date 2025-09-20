import { Module } from '@nestjs/common';
import { NfcOperationsService } from './services/nfc-operations.service';
import { NfcReadService } from './services/nfc-read.service';
import { NfcWriteService } from './services/nfc-write.service';
import { NfcRemoveService } from './services/nfc-remove.service';
import { NfcGateway } from './nfc.gateway';
import { NfcService } from './nfc.service';
import { PrepareDataService } from './services/prepare-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [
    NfcGateway,
    NfcService,
    NfcOperationsService,
    NfcReadService,
    NfcWriteService,
    NfcRemoveService,
    PrepareDataService,
  ],
  exports: [NfcService, NfcOperationsService],
})
export class NfcModule {}
