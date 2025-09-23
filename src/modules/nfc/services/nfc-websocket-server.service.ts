import { Injectable, Logger } from '@nestjs/common';
import { WebSocket, Server as WSServer } from 'ws';

@Injectable()
export class NfcWebSocketServerService {
  private readonly logger = new Logger(NfcWebSocketServerService.name);

  private clientWSS: WSServer;
  private bridgeWSS: WSServer;

  setupServers(
    onBridgeConnection: (ws: WebSocket, clientId: string) => void,
    onClientConnection: (ws: WebSocket, clientId: string) => void,
  ) {
    // Create separate WebSocket servers like api-server.js
    this.clientWSS = new WSServer({ port: 3002 });
    this.bridgeWSS = new WSServer({ port: 3003 });

    // Setup Bridge WebSocket
    this.bridgeWSS.on('connection', (ws: WebSocket) => {
      console.log('🔗 NFC Bridge connected');
      const clientId = this.generateClientId();
      onBridgeConnection(ws, clientId);
    });

    // Setup Client WebSocket
    this.clientWSS.on('connection', (ws: WebSocket) => {
      console.log('👤 Client connected');
      const clientId = this.generateClientId();
      onClientConnection(ws, clientId);
    });

    this.logger.log('✅ NFC WebSocket Server started');
    this.logger.log('📡 Bridge WebSocket: ws://localhost:3003');
    this.logger.log('👤 Client WebSocket: ws://localhost:3002');
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  cleanup() {
    if (this.clientWSS) {
      this.clientWSS.close();
    }
    if (this.bridgeWSS) {
      this.bridgeWSS.close();
    }
  }

  getClientServer(): WSServer {
    return this.clientWSS;
  }

  getBridgeServer(): WSServer {
    return this.bridgeWSS;
  }
}
