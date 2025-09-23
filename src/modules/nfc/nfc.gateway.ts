import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway(1339, { cors: true })
export class NfcGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NfcGateway.name);

  private messageHandlers: ((data: any) => void)[] = [];
  private connectedClients = new Map<string, WebSocket>();

  afterInit() {
    this.logger.log('✅ NFC WebSocket Gateway initialized on port 1339');
  }

  handleConnection(client: WebSocket) {
    const clientId = `frontend_${Date.now()}_${Math.random()}`;
    this.logger.log(`Frontend client connected: ${clientId}`);
    this.connectedClients.set(clientId, client);

    client.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        this.logger.debug(`Frontend request: ${data.type}`);

        // Forward frontend request to backend for processing
        this.messageHandlers.forEach((fn) =>
          fn({
            type: 'FRONTEND_REQUEST',
            clientId,
            action: data.type,
            payload: data,
          }),
        );
      } catch (e) {
        this.logger.error('Invalid message from frontend client');
        this.sendErrorToClient(clientId, 'Invalid message format');
      }
    });

    client.on('close', () => {
      this.logger.warn(`Frontend client disconnected: ${clientId}`);
      this.connectedClients.delete(clientId);
    });

    // Send connection confirmation
    this.sendToClient(clientId, {
      type: 'connection_confirmed',
      clientId,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect() {
    this.logger.warn('Frontend client disconnected');
  }

  // Send response back to specific frontend client
  sendToClient(clientId: string, msg: any) {
    const client = this.connectedClients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          ...msg,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  // Send error to specific client
  sendErrorToClient(clientId: string, error: string) {
    this.sendToClient(clientId, {
      type: 'error',
      error,
      success: false,
    });
  }

  // Broadcast to all frontend clients (untuk notifikasi umum)
  broadcast(msg: any) {
    this.logger.debug(
      `Broadcasting to ${this.connectedClients.size} frontend clients: ${msg.type}`,
    );

    const payload = JSON.stringify({
      ...msg,
      timestamp: new Date().toISOString(),
    });

    this.connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  getConnectedClients(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
