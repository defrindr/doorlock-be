import { Module } from '@nestjs/common';
import { NfcOperationsService } from './services/nfc-operations.service';
import { NfcReadService } from './services/nfc-read.service';
import { NfcWriteService } from './services/nfc-write.service';
import { NfcRemoveService } from './services/nfc-remove.service';
import { NfcGateway } from './nfc.gateway';
import { NfcService } from './nfc.service';

@Module({
  providers: [
    NfcGateway,
    NfcService,
    NfcOperationsService,
    NfcReadService,
    NfcWriteService,
    NfcRemoveService,
  ],
  exports: [NfcService, NfcOperationsService],
})
export class NfcModule {}
