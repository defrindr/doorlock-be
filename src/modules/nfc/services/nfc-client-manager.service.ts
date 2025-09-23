import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { NfcClient } from '../interfaces/nfc-client.interface';

@Injectable()
export class NfcClientManagerService {
  private readonly logger = new Logger(NfcClientManagerService.name);

  private nfcClients = new Map<string, NfcClient>();

  addClient(client: NfcClient) {
    this.nfcClients.set(client.id, client);
    this.logger.log(`Client added: ${client.id} (${client.type})`);
  }

  removeClient(clientId: string) {
    const client = this.nfcClients.get(clientId);
    if (client) {
      this.logger.log(`Client removed: ${clientId} (${client.type})`);
      this.nfcClients.delete(clientId);
    }
    return client;
  }

  getClient(clientId: string): NfcClient | undefined {
    return this.nfcClients.get(clientId);
  }

  getBridgeClient(): NfcClient | undefined {
    return Array.from(this.nfcClients.values()).find(
      (client) => client.type === 'nfc_bridge',
    );
  }

  getAllClients(): NfcClient[] {
    return Array.from(this.nfcClients.values());
  }

  getFrontendClients(): NfcClient[] {
    return Array.from(this.nfcClients.values()).filter(
      (client) => client.type === 'frontend',
    );
  }

  broadcastToClients(
    type: string,
    data: any,
    excludeId?: string,
    sendMessage?: (ws: WebSocket, type: string, data: any) => void,
  ) {
    this.nfcClients.forEach((client) => {
      if (excludeId && client.id === excludeId) return;

      console.log('Sending message to client:', type);
      if (sendMessage) {
        sendMessage(client.ws, type, data);
      }
    });
  }

  broadcastToFrontend(
    type: string,
    data: any,
    sendMessage: (ws: WebSocket, type: string, data: any) => void,
  ) {
    this.getFrontendClients().forEach((client) => {
      sendMessage(client.ws, type, data);
    });
  }

  cleanup() {
    this.nfcClients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    });
    this.nfcClients.clear();
  }

  getNfcBridgeStatus(): {
    connected: boolean;
    readers: string[];
    bridgeId?: string;
  } {
    const bridge = this.getBridgeClient();

    return {
      connected: !!bridge,
      readers: bridge?.readers || [],
      bridgeId: bridge?.bridgeId,
    };
  }
}
