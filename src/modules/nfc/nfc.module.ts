import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfcWebSocketService } from './nfc-websocket.service';
import { NfcGateway } from './nfc.gateway';
import { PrepareDataService } from './services/prepare-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [],
  providers: [NfcGateway, NfcWebSocketService, PrepareDataService],
  exports: [
    NfcWebSocketService,
    NfcGateway,
    // NfcOperationsService,
    PrepareDataService,
  ],
})
export class NfcModule {}
