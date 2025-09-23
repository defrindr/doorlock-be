import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { WebSocket, Server as WSServer } from 'ws';
import { NfcGateway } from './nfc.gateway';
import { PrepareDataService } from './services/prepare-data.service';

export interface NfcClient {
  id: string;
  type: 'frontend' | 'nfc_bridge';
  ws: WebSocket;
  bridgeId?: string;
  readers?: string[];
  lastHeartbeat?: Date;
}

export interface NfcMessage {
  type: string;
  requestId?: string;
  reader?: string;
  readerName?: string;
  card?: {
    uid: string;
    atr?: string;
    standard?: string;
    type?: string;
  };
  data?: any;
  payload?: any; // Add payload property to match api-server.js
  error?: string;
  success?: boolean;
  readers?: any[];
  timestamp?: string;
  bridgeId?: string;
  writeData?: any;
}

@Injectable()
export class NfcWebSocketService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NfcWebSocketService.name);

  private wsServer: WSServer;
  private nfcClients = new Map<string, NfcClient>();
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
      timeout: NodeJS.Timeout;
      clientId: string;
    }
  >();
  
  // Add state tracking like api-server.js
  private nfcData: any = null;
  private cardStatus = { present: false, uid: null };

  constructor(
    private readonly gateway: NfcGateway,
    private readonly prepareDataService: PrepareDataService,
  ) {}

  onModuleInit() {
    this.logger.log('NFC WebSocket Service initialized');
    this.setupWebSocketServer();
    this.setupFrontendMessageHandler();
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

    // Forward to NFC bridge dengan format yang sesuai
    const result = await this.sendToNfcBridge('read_card_request', {
      readerName,
    });

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

    // Forward to NFC bridge
    const result = await this.sendToNfcBridge('write_card_request', {
      readerName,
      writeData,
    });

    return result;
  }

  private async handleRemoveCardRequest(payload: any): Promise<any> {
    const { readerName } = payload;

    if (!readerName) {
      throw new Error('Reader name is required');
    }

    // Forward to NFC bridge
    const result = await this.sendToNfcBridge('remove_card_request', {
      readerName,
    });

    return result;
  }

  private async handleGetReadersRequest(): Promise<any> {
    // Get current bridge status
    const bridgeStatus = this.getNfcBridgeStatus();

    if (!bridgeStatus.connected) {
      throw new Error('NFC Bridge not connected');
    }

    // Request fresh readers status from bridge
    const result = await this.sendToNfcBridge('get_readers_request', {});

    return result;
  }

  onModuleDestroy() {
    this.cleanup();
  }

  private setupWebSocketServer() {
    // Create separate WebSocket servers like api-server.js
    const clientWSS = new WSServer({ port: 3002 });
    const bridgeWSS = new WSServer({ port: 3003 });

    this.wsServer = clientWSS; // Keep reference for cleanup

    // Setup Bridge WebSocket (matches api-server.js setupBridgeWebSocket)
    bridgeWSS.on('connection', (ws: WebSocket) => {
      console.log('🔗 NFC Bridge connected');
      const clientId = this.generateClientId();

      const bridgeClient: NfcClient = {
        id: clientId,
        type: 'nfc_bridge',
        ws,
        lastHeartbeat: new Date(),
      };

      this.nfcClients.set(clientId, bridgeClient);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleBridgeMessage(clientId, message);
        } catch (err) {
          this.logger.error('❌ Error parsing bridge message:', err);
        }
      });

      ws.on('close', () => {
        console.log('⚠️ NFC Bridge disconnected');
        this.nfcClients.delete(clientId);
        // Reset state when bridge disconnects
        this.cardStatus = { present: false, uid: null };
        this.nfcData = null;
        this.broadcastToClients('BRIDGE_DISCONNECTED', {});
      });

      ws.on('error', (err) => {
        console.error('❌ Bridge WebSocket error:', err);
      });
    });

    // Setup Client WebSocket (matches api-server.js setupClientWebSocket)
    clientWSS.on('connection', (ws: WebSocket) => {
      console.log('👤 Client connected');
      const clientId = this.generateClientId();

      const client: NfcClient = {
        id: clientId,
        type: 'frontend',
        ws,
        lastHeartbeat: new Date(),
      };

      this.nfcClients.set(clientId, client);

      // Send current status to new client (matches api-server.js)
      const bridgeClient = this.getBridgeClient();

      this.sendMessage(ws, 'STATUS', {
        bridgeConnected: !!bridgeClient,
        cardStatus: this.cardStatus,
        nfcData: this.nfcData,
      });

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleClientMessage(clientId, ws, message);
        } catch (err) {
          console.error('❌ Error parsing client message:', err);
        }
      });

      ws.on('close', () => {
        console.log('👤 Client disconnected');
        this.nfcClients.delete(clientId);
      });

      ws.on('error', (error) => {
        this.logger.error(`WebSocket error from ${clientId}: ${error.message}`);
      });
    });

    this.logger.log('✅ NFC WebSocket Server started');
    this.logger.log('📡 Bridge WebSocket: ws://localhost:3003');
    this.logger.log('👤 Client WebSocket: ws://localhost:3002');
  }

  // New methods to match api-server.js structure
  private getBridgeClient(): NfcClient | undefined {
    return Array.from(this.nfcClients.values()).find(
      (client) => client.type === 'nfc_bridge',
    );
  }

  private handleBridgeMessage(clientId: string, message: NfcMessage) {
    console.log('📨 Bridge message:', message.type);

    // Update internal state tracking
    switch (message.type) {
      case 'CARD_DETECTED':
        // Track card status for status updates
        this.cardStatus = { present: true, uid: message.payload?.uid || null };
        this.broadcastToClients('CARD_DETECTED', message.payload || {});
        break;

      case 'CARD_REMOVED':
        this.cardStatus = { present: false, uid: null };
        this.nfcData = null;
        this.broadcastToClients('CARD_REMOVED', message.payload || {});
        break;

      case 'READ_RESULT':
        // Store NFC data for status updates
        this.nfcData = message.payload;
        this.broadcastToClients('READ_RESULT', message.payload || {});
        // Also send to NFC Gateway for existing functionality
        this.gateway.broadcast({
          type: 'READ_RESULT',
          payload: message.payload || message,
        });
        break;

      case 'READER_CONNECTED':
        this.broadcastToClients('READER_CONNECTED', message.payload || {});
        break;
        
      case 'READER_DISCONNECTED':
        this.broadcastToClients('READER_DISCONNECTED', message.payload || {});
        break;
        
      case 'READER_ERROR':
        this.broadcastToClients('READER_ERROR', message.payload || {});
        break;
        
      case 'WRITE_RESULT':
        this.broadcastToClients('WRITE_RESULT', message.payload || {});
        break;
        
      case 'REMOVE_RESULT':
        this.broadcastToClients('REMOVE_RESULT', message.payload || {});
        break;
        
      case 'ERROR':
        this.broadcastToClients('ERROR', message.payload || {});
        break;

      default:
        console.log(`Unknown bridge message type: ${message.type}`);
    }
  }

  private async handleClientMessage(
    clientId: string,
    ws: WebSocket,
    message: any,
  ) {
    console.log('👤 Client message:', message.type);

    // Forward client requests to bridge (matches api-server.js handleClientMessage)
    if (
      ['READ_CARD', 'WRITE_CARD', 'REMOVE_CARD_DATA'].includes(message.type)
    ) {
      const bridgeClient = this.getBridgeClient();
      if (!bridgeClient) {
        this.broadcastToClients('ERROR', {
          message: 'NFC Bridge not connected',
        });
        return;
      }

      this.sendToBridge(message);
    }

    // Handle legacy message types for backward compatibility
    switch (message.type) {
      case 'identify':
        this.handleClientIdentification(clientId, ws, message);
        break;
      case 'nfc_bridge_connected':
      case 'reader_connected':
      case 'card_detected':
      case 'card_removed':
      case 'reader_error':
      case 'nfc_error':
      case 'heartbeat':
        this.handleNfcMessage(clientId, message);
        break;
      case 'read_card_response':
      case 'write_card_response':
      case 'remove_card_response':
      case 'readers_response':
      case 'pong':
      case 'operation_error':
        this.handleOperationResponse(clientId, message);
        break;
      default:
        console.log(`Unknown client message type: ${message.type}`);
        break;
    }
  }

  private sendToBridge(message: any): Promise<any> {
    const bridgeClient = this.getBridgeClient();

    if (!bridgeClient || bridgeClient.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('Bridge not connected'));
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Bridge operation timeout'));
      }, 10000);

      const handler = (data: any) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.type === 'ERROR') {
            clearTimeout(timeout);
            bridgeClient.ws.off('message', handler);
            reject(new Error(response.payload?.message || 'Operation failed'));
          } else if (response.type.includes('RESULT')) {
            clearTimeout(timeout);
            bridgeClient.ws.off('message', handler);
            resolve(response);
          }
        } catch (err) {
          // Ignore parsing errors for other messages
        }
      };

      bridgeClient.ws.on('message', handler);
      bridgeClient.ws.send(JSON.stringify(message));
    });
  }

  private handleClientIdentification(
    clientId: string,
    ws: WebSocket,
    data: any,
  ) {
    const client: NfcClient = {
      id: clientId,
      type: data.type || 'frontend',
      ws,
      bridgeId: data.bridgeId,
      lastHeartbeat: new Date(),
    };

    this.nfcClients.set(clientId, client);

    this.logger.log(
      `Client identified: ${clientId} as ${client.type}${data.bridgeId ? ` (${data.bridgeId})` : ''}`,
    );

    // Send confirmation
    this.sendMessage(ws, 'identification_confirmed', {
      clientId,
      type: client.type,
      timestamp: new Date().toISOString(),
    });

    // If it's an NFC bridge, request readers status
    if (client.type === 'nfc_bridge') {
      this.sendMessage(ws, 'get_readers_request', {
        requestId: `readers_${Date.now()}`,
      });
    }

    // Notify other clients about new connection
    this.broadcastToClients(
      'client_connected',
      {
        clientId,
        type: client.type,
        bridgeId: data.bridgeId,
      },
      clientId,
    );
  }

  private handleNfcMessage(clientId: string, message: NfcMessage) {
    const client = this.nfcClients.get(clientId);
    if (!client) {
      this.logger.warn(`Received message from unknown client: ${clientId}`);
      return;
    }

    this.logger.debug(`NFC message from ${client.type}: ${message.type}`);

    switch (message.type) {
      case 'nfc_bridge_connected':
        this.handleBridgeConnected(client, message);
        break;
      case 'reader_connected':
        this.handleReaderConnected(client, message);
        break;
      case 'card_detected':
        this.handleCardDetected(client, message);
        break;
      case 'card_removed':
        this.handleCardRemoved(client, message);
        break;
      case 'reader_error':
      case 'nfc_error':
        this.handleNfcError(client, message);
        break;
      case 'heartbeat':
        this.handleHeartbeat(client, message);
        break;
    }
  }

  private handleBridgeConnected(client: NfcClient, message: NfcMessage) {
    client.bridgeId = message.bridgeId;
    client.readers = message.readers || [];

    this.logger.log(
      `NFC Bridge connected: ${message.bridgeId} with ${client.readers.length} readers`,
    );

    // Broadcast to frontend clients
    this.broadcastToFrontend('nfc_bridge_status', {
      connected: true,
      bridgeId: message.bridgeId,
      readers: client.readers,
      timestamp: message.timestamp,
    });

    // Also send to NFC Gateway for existing functionality
    this.gateway.broadcast({
      type: 'BRIDGE_CONNECTED',
      payload: {
        bridgeId: message.bridgeId,
        readers: client.readers,
      },
    });
  }

  private handleReaderConnected(client: NfcClient, message: NfcMessage) {
    if (client.readers && message.reader) {
      if (!client.readers.includes(message.reader)) {
        client.readers.push(message.reader);
      }
    }

    this.logger.log(`Reader connected: ${message.reader}`);

    // Broadcast to all clients
    this.broadcastToClients('reader_connected', {
      reader: message.reader,
      timestamp: message.timestamp,
    });

    // Also send to NFC Gateway for existing functionality
    this.gateway.broadcast({
      type: 'READER_CONNECTED',
      payload: { name: message.reader },
    });
  }

  private async handleCardDetected(client: NfcClient, message: NfcMessage) {
    this.logger.log(`Card detected: ${message.card?.uid} on ${message.reader}`);

    // Broadcast to all clients
    this.broadcastToClients('card_detected', {
      reader: message.reader,
      card: message.card,
      timestamp: message.timestamp,
    });

    // Send to NFC Gateway for existing functionality
    this.gateway.broadcast({
      type: 'CARD_DETECTED',
      payload: {
        uid: message.card?.uid,
        reader: message.reader,
        card: message.card,
      },
    });

    // Auto-trigger card read using existing services
    if (client.type === 'nfc_bridge' && message.reader) {
      try {
        await this.requestCardRead(message.reader);
      } catch (error: any) {
        this.logger.error(`Auto-read failed: ${error.message}`);
      }
    }
  }

  private handleCardRemoved(client: NfcClient, message: NfcMessage) {
    this.logger.log(
      `Card removed: ${message.card?.uid} from ${message.reader}`,
    );

    // Broadcast to all clients
    this.broadcastToClients('card_removed', {
      reader: message.reader,
      card: message.card,
      timestamp: message.timestamp,
    });

    // Send to NFC Gateway for existing functionality
    this.gateway.broadcast({
      type: 'CARD_REMOVED',
      payload: { uid: message.card?.uid },
    });
  }

  private handleNfcError(client: NfcClient, message: NfcMessage) {
    this.logger.error(
      `NFC Error from ${client.bridgeId || client.id}: ${message.error}`,
    );

    // Broadcast error to all clients
    this.broadcastToClients('nfc_error', {
      error: message.error,
      reader: message.reader,
      timestamp: message.timestamp,
    });

    // Send to NFC Gateway
    this.gateway.broadcast({
      type: 'NFC_ERROR',
      payload: { message: message.error },
    });
  }

  private handleHeartbeat(client: NfcClient, message: NfcMessage) {
    client.lastHeartbeat = new Date();
    if (message.data?.readersCount !== undefined) {
      // Update readers count from bridge
    }
  }

  private handleOperationResponse(clientId: string, message: NfcMessage) {
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const request = this.pendingRequests.get(message.requestId)!;
      clearTimeout(request.timeout);
      this.pendingRequests.delete(message.requestId);

      if (message.success !== false && message.type !== 'operation_error') {
        // Process read data if it's a read response
        if (message.type === 'read_card_response' && message.data) {
          // Send processed data to gateway using existing services
          this.gateway.broadcast({
            type: 'READ_RESULT',
            payload: {
              uid: message.data.uid,
              reader: message.data.reader,
              timestamp: message.data.timestamp,
              rawData: message.data.cardData,
            },
          });
        }

        request.resolve(message.data || { success: true });
      } else {
        request.reject(new Error(message.error || 'Operation failed'));
      }
    }

    // Also broadcast operation results to frontend
    this.broadcastToFrontend('operation_result', {
      type: message.type,
      success: message.success,
      data: message.data,
      error: message.error,
      requestId: message.requestId,
    });
  }

  private handleClientDisconnect(clientId: string) {
    const client = this.nfcClients.get(clientId);
    if (client) {
      this.logger.log(`Client disconnected: ${clientId} (${client.type})`);

      if (client.type === 'nfc_bridge') {
        // Notify that NFC bridge is disconnected
        this.broadcastToFrontend('nfc_bridge_status', {
          connected: false,
          bridgeId: client.bridgeId,
        });

        // Send to NFC Gateway
        this.gateway.broadcast({
          type: 'BRIDGE_DISCONNECTED',
          payload: { bridgeId: client.bridgeId },
        });
      }

      this.nfcClients.delete(clientId);

      // Reject any pending requests from this client
      const pendingFromClient = Array.from(
        this.pendingRequests.entries(),
      ).filter(([, req]) => req.clientId === clientId);

      pendingFromClient.forEach(([requestId, req]) => {
        clearTimeout(req.timeout);
        req.reject(new Error('Client disconnected'));
        this.pendingRequests.delete(requestId);
      });
    }
  }

  private broadcastToClients(type: string, data: any, excludeId?: string) {
    this.nfcClients.forEach((client) => {
      if (excludeId && client.id === excludeId) return;

      console.log('Sending message to client:', type);
      this.sendMessage(client.ws, type, data);
    });
  }

  private broadcastToFrontend(type: string, data: any) {
    this.nfcClients.forEach((client) => {
      if (client.type === 'frontend') {
        this.sendMessage(client.ws, type, data);
      }
    });
  }

  private sendToNfcBridge(type: string, data: any): Promise<any> {
    const nfcBridge = Array.from(this.nfcClients.values()).find(
      (client) => client.type === 'nfc_bridge',
    );

    if (!nfcBridge) {
      return Promise.reject(new Error('NFC Bridge not connected'));
    }

    const requestId = `${type}_${Date.now()}_${Math.random()}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Request timeout'));
      }, 10000);

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout,
        clientId: nfcBridge.id,
      });

      this.sendMessage(nfcBridge.ws, type, {
        requestId,
        ...data,
      });
    });
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

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanup() {
    // Clear all pending requests
    this.pendingRequests.forEach((request) => {
      clearTimeout(request.timeout);
      request.reject(new Error('Service shutting down'));
    });
    this.pendingRequests.clear();

    // Close all client connections
    this.nfcClients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    });
    this.nfcClients.clear();

    // Close WebSocket server
    if (this.wsServer) {
      this.wsServer.close();
    }
  }

  // Public API methods using existing services
  async requestCardRead(readerName: string): Promise<any> {
    return this.sendToNfcBridge('read_card_request', { readerName });
  }

  async requestCardWrite(readerName: string, data: any): Promise<any> {
    // Prepare data using existing prepare service
    const writeData = await this.prepareDataService.prepare(data);
    return this.sendToNfcBridge('write_card_request', {
      readerName,
      writeData,
    });
  }

  async requestCardRemove(readerName: string): Promise<any> {
    return this.sendToNfcBridge('remove_card_request', { readerName });
  }

  getConnectedClients(): NfcClient[] {
    return Array.from(this.nfcClients.values());
  }

  getNfcBridgeStatus(): {
    connected: boolean;
    readers: string[];
    bridgeId?: string;
  } {
    const bridge = Array.from(this.nfcClients.values()).find(
      (client) => client.type === 'nfc_bridge',
    );

    return {
      connected: !!bridge,
      readers: bridge?.readers || [],
      bridgeId: bridge?.bridgeId,
    };
  }
}
