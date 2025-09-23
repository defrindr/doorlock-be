import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { WebSocket } from 'ws';
import { NfcClient } from './interfaces/nfc-client.interface';
import { NfcGateway } from './nfc.gateway';
import { NfcBridgeCommunicationService } from './services/nfc-bridge-communication.service';
import { NfcClientManagerService } from './services/nfc-client-manager.service';
import { NfcMessageHandlerService } from './services/nfc-message-handler.service';
import { NfcWebSocketServerService } from './services/nfc-websocket-server.service';
import { PrepareDataService } from './services/prepare-data.service';

@Injectable()
export class NfcWebSocketService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NfcWebSocketService.name);

  // Add state tracking like api-server.js
  private nfcData: any = null;
  private cardStatus = { present: false, uid: null };

  constructor(
    private readonly gateway: NfcGateway,
    private readonly prepareDataService: PrepareDataService,
    private readonly webSocketServerService: NfcWebSocketServerService,
    private readonly messageHandlerService: NfcMessageHandlerService,
    private readonly clientManagerService: NfcClientManagerService,
    private readonly bridgeCommunicationService: NfcBridgeCommunicationService,
  ) {}

  onModuleInit() {
    this.logger.log('NFC WebSocket Service initialized');
    this.setupWebSocketServer();
    this.setupFrontendMessageHandler();
  }

  private setupWebSocketServer() {
    this.webSocketServerService.setupServers(
      (ws: WebSocket, clientId: string) =>
        this.handleBridgeConnection(ws, clientId),
      (ws: WebSocket, clientId: string) =>
        this.handleClientConnection(ws, clientId),
    );
  }

  private handleBridgeConnection(ws: WebSocket, clientId: string) {
    const bridgeClient: NfcClient = {
      id: clientId,
      type: 'nfc_bridge',
      ws,
      lastHeartbeat: new Date(),
    };

    this.clientManagerService.addClient(bridgeClient);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.messageHandlerService.handleBridgeMessage(
          message,
          (type: string, data: any) => this.broadcastToClients(type, data),
        );
      } catch (err) {
        this.logger.error('❌ Error parsing bridge message:', err);
      }
    });

    ws.on('close', () => {
      console.log('⚠️ NFC Bridge disconnected');
      this.clientManagerService.removeClient(clientId);
      this.messageHandlerService.resetState();
      this.broadcastToClients('BRIDGE_DISCONNECTED', {});
    });

    ws.on('error', (err) => {
      console.error('❌ Bridge WebSocket error:', err);
    });
  }

  private handleClientConnection(ws: WebSocket, clientId: string) {
    const client: NfcClient = {
      id: clientId,
      type: 'frontend',
      ws,
      lastHeartbeat: new Date(),
    };

    this.clientManagerService.addClient(client);

    // Send current status to new client
    const bridgeClient = this.clientManagerService.getBridgeClient();
    this.sendMessage(ws, 'STATUS', {
      bridgeConnected: !!bridgeClient,
      cardStatus: this.messageHandlerService.getCardStatus(),
      nfcData: this.messageHandlerService.getNfcData(),
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.messageHandlerService.handleClientMessage(
          message,
          (msg: any) => this.sendToBridge(msg),
          (type: string, data: any) => this.broadcastToClients(type, data),
        );
      } catch (err) {
        console.error('❌ Error parsing client message:', err);
      }
    });

    ws.on('close', () => {
      console.log('👤 Client disconnected');
      this.clientManagerService.removeClient(clientId);
    });

    ws.on('error', (error) => {
      this.logger.error(`WebSocket error from ${clientId}: ${error.message}`);
    });
  }

  private setupFrontendMessageHandler() {
    // Listen untuk request dari frontend
    this.gateway.onMessage((data) => {
      if (data.type === 'FRONTEND_REQUEST') {
        this.handleFrontendRequest(data);
      }
    });
  }

  private async handleFrontendRequest(data: any) {
    const { clientId, action, payload } = data;

    this.logger.log(`Frontend request: ${action} from client ${clientId}`);

    try {
      let result;

      switch (action) {
        case 'read_card':
          result = await this.handleReadCardRequest(payload);
          break;
        case 'write_card':
          result = await this.handleWriteCardRequest(payload);
          break;
        case 'remove_card':
          result = await this.handleRemoveCardRequest(payload);
          break;
        case 'get_readers':
          result = await this.handleGetReadersRequest();
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      // Send success response back to frontend
      this.gateway.sendToClient(clientId, {
        type: 'nfc_response',
        action,
        success: true,
        data: result,
      });
    } catch (error: any) {
      // Send error response back to frontend
      this.logger.error(`Frontend request failed: ${error.message}`);
      this.gateway.sendErrorToClient(clientId, error.message);
    }
  }

  private async handleReadCardRequest(payload: any): Promise<any> {
    const { readerName } = payload;

    if (!readerName) {
      throw new Error('Reader name is required');
    }

    // Forward to NFC bridge
    const bridgeClient = this.clientManagerService.getBridgeClient();
    const result = await this.bridgeCommunicationService.sendToNfcBridge(
      bridgeClient,
      'read_card_request',
      { readerName },
      (ws, type, data) => this.sendMessage(ws, type, data),
    );

    return result;
  }

  private async handleWriteCardRequest(payload: any): Promise<any> {
    const { readerName, data } = payload;

    if (!readerName) {
      throw new Error('Reader name is required');
    }

    if (!data) {
      throw new Error('Data is required for write operation');
    }

    // Prepare data using existing service
    const writeData = await this.prepareDataService.prepare(data);
    const bridgeClient = this.clientManagerService.getBridgeClient();

    // Forward to NFC bridge
    const result = await this.bridgeCommunicationService.sendToNfcBridge(
      bridgeClient,
      'write_card_request',
      { readerName, writeData },
      (ws, type, data) => this.sendMessage(ws, type, data),
    );

    return result;
  }

  private async handleRemoveCardRequest(payload: any): Promise<any> {
    const { readerName } = payload;

    if (!readerName) {
      throw new Error('Reader name is required');
    }

    const bridgeClient = this.clientManagerService.getBridgeClient();

    // Forward to NFC bridge
    const result = await this.bridgeCommunicationService.sendToNfcBridge(
      bridgeClient,
      'remove_card_request',
      { readerName },
      (ws, type, data) => this.sendMessage(ws, type, data),
    );

    return result;
  }

  private async handleGetReadersRequest(): Promise<any> {
    // Get current bridge status
    const bridgeStatus = this.clientManagerService.getNfcBridgeStatus();

    if (!bridgeStatus.connected) {
      throw new Error('NFC Bridge not connected');
    }

    const bridgeClient = this.clientManagerService.getBridgeClient();

    // Request fresh readers status from bridge
    const result = await this.bridgeCommunicationService.sendToNfcBridge(
      bridgeClient,
      'get_readers_request',
      {},
      (ws, type, data) => this.sendMessage(ws, type, data),
    );

    return result;
  }

  onModuleDestroy() {
    this.cleanup();
  }

  private sendToBridge(message: any): Promise<any> {
    const bridgeClient = this.clientManagerService.getBridgeClient();
    return this.bridgeCommunicationService.sendToBridge(bridgeClient, message);
  }

  private broadcastToClients(type: string, data: any, excludeId?: string) {
    this.clientManagerService.broadcastToClients(
      type,
      data,
      excludeId,
      (ws, msgType, msgData) => this.sendMessage(ws, msgType, msgData),
    );
  }

  private sendMessage(ws: WebSocket, type: string, data: any = {}) {
    if (ws.readyState === WebSocket.OPEN) {
      // Match api-server.js message format with payload structure
      const message = {
        type,
        payload: data,
        timestamp: new Date().toISOString(),
      };

      ws.send(JSON.stringify(message));
    }
  }

  private cleanup() {
    this.clientManagerService.cleanup();
    this.bridgeCommunicationService.cleanup();
    this.webSocketServerService.cleanup();
  }

  // Public API methods
  async requestCardRead(readerName: string): Promise<any> {
    const bridgeClient = this.clientManagerService.getBridgeClient();
    return this.bridgeCommunicationService.sendToNfcBridge(
      bridgeClient,
      'read_card_request',
      { readerName },
      (ws, type, data) => this.sendMessage(ws, type, data),
    );
  }

  async requestCardWrite(readerName: string, data: any): Promise<any> {
    // Prepare data using existing service
    const writeData = await this.prepareDataService.prepare(data);
    const bridgeClient = this.clientManagerService.getBridgeClient();

    return this.bridgeCommunicationService.sendToNfcBridge(
      bridgeClient,
      'write_card_request',
      { readerName, writeData },
      (ws, type, data) => this.sendMessage(ws, type, data),
    );
  }

  async requestCardRemove(readerName: string): Promise<any> {
    const bridgeClient = this.clientManagerService.getBridgeClient();
    return this.bridgeCommunicationService.sendToNfcBridge(
      bridgeClient,
      'remove_card_request',
      { readerName },
      (ws, type, data) => this.sendMessage(ws, type, data),
    );
  }

  getConnectedClients(): NfcClient[] {
    return this.clientManagerService.getAllClients();
  }

  getNfcBridgeStatus(): {
    connected: boolean;
    readers: string[];
    bridgeId?: string;
  } {
    return this.clientManagerService.getNfcBridgeStatus();
  }
}
