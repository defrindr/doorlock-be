import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfcWebSocketService } from './nfc-websocket.service';
import { NfcGateway } from './nfc.gateway';
import { PrepareDataService } from './services/prepare-data.service';
import { NfcWebSocketServerService } from './services/nfc-websocket-server.service';
import { NfcMessageHandlerService } from './services/nfc-message-handler.service';
import { NfcClientManagerService } from './services/nfc-client-manager.service';
import { NfcBridgeCommunicationService } from './services/nfc-bridge-communication.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [],
  providers: [
    NfcGateway,
    NfcWebSocketService,
    PrepareDataService,
    NfcWebSocketServerService,
    NfcMessageHandlerService,
    NfcClientManagerService,
    NfcBridgeCommunicationService,
  ],
  exports: [
    NfcWebSocketService,
    NfcGateway,
    PrepareDataService,
    NfcWebSocketServerService,
    NfcMessageHandlerService,
    NfcClientManagerService,
    NfcBridgeCommunicationService,
  ],
})
export class NfcModule {}
