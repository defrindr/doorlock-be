import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway(1339, { cors: true }) // Runs on port 3001
export class NfcGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NfcGateway.name);

  private messageHandlers: ((data: any) => void)[] = [];

  afterInit() {
    this.logger.log('✅ WebSocket gateway initialized');
  }

  handleConnection(client: WebSocket) {
    this.logger.log('Client connected');
    client.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        this.messageHandlers.forEach((fn) => fn(data));
      } catch (e) {
        this.logger.error('Invalid WS message');
      }
    });
  }

  handleDisconnect() {
    this.logger.warn('Client disconnected');
  }

  broadcast(msg: any) {
    const payload = JSON.stringify(msg);
    this.server.clients?.forEach((c: any) => {
      if (c.readyState === 1) c.send(payload);
    });
  }

  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }
}
