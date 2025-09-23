import { Injectable, Logger } from '@nestjs/common';
import { NfcMessage } from '../interfaces/nfc-message.interface';
import { NfcGateway } from '../nfc.gateway';

@Injectable()
export class NfcMessageHandlerService {
  private readonly logger = new Logger(NfcMessageHandlerService.name);

  // State tracking
  private nfcData: any = null;
  private cardStatus = { present: false, uid: null };

  constructor(private readonly gateway: NfcGateway) {}

  handleBridgeMessage(
    message: NfcMessage,
    broadcastToClients: (type: string, data: any) => void,
  ) {
    console.log('📨 Bridge message:', message.type);

    // Update internal state tracking
    switch (message.type) {
      case 'CARD_DETECTED':
        this.cardStatus = { present: true, uid: message.payload?.uid || null };
        broadcastToClients('CARD_DETECTED', message.payload || {});
        break;

      case 'CARD_REMOVED':
        this.cardStatus = { present: false, uid: null };
        this.nfcData = null;
        broadcastToClients('CARD_REMOVED', message.payload || {});
        break;

      case 'READ_RESULT':
        this.nfcData = message.payload;
        broadcastToClients('READ_RESULT', message.payload || {});
        // Also send to NFC Gateway for existing functionality
        this.gateway.broadcast({
          type: 'READ_RESULT',
          payload: message.payload || message,
        });
        break;

      case 'READER_CONNECTED':
        broadcastToClients('READER_CONNECTED', message.payload || {});
        break;

      case 'READER_DISCONNECTED':
        broadcastToClients('READER_DISCONNECTED', message.payload || {});
        break;

      case 'READER_ERROR':
        broadcastToClients('READER_ERROR', message.payload || {});
        break;

      case 'WRITE_RESULT':
        broadcastToClients('WRITE_RESULT', message.payload || {});
        break;

      case 'REMOVE_RESULT':
        broadcastToClients('REMOVE_RESULT', message.payload || {});
        break;

      case 'ERROR':
        broadcastToClients('ERROR', message.payload || {});
        break;

      default:
        console.log(`Unknown bridge message type: ${message.type}`);
    }
  }

  async handleClientMessage(
    message: any,
    sendToBridge: (message: any) => Promise<any>,
    broadcastToClients: (type: string, data: any) => void,
  ) {
    console.log('👤 Client message:', message.type);

    // Forward client requests to bridge
    if (
      ['READ_CARD', 'WRITE_CARD', 'REMOVE_CARD_DATA'].includes(message.type)
    ) {
      try {
        await sendToBridge(message);
      } catch (error) {
        broadcastToClients('ERROR', {
          message: 'NFC Bridge not connected',
        });
      }
    }
  }

  getCardStatus() {
    return this.cardStatus;
  }

  getNfcData() {
    return this.nfcData;
  }

  resetState() {
    this.cardStatus = { present: false, uid: null };
    this.nfcData = null;
  }
}
