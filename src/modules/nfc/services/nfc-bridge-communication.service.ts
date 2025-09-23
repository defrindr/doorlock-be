import { Injectable, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { NfcClient } from '../interfaces/nfc-client.interface';

@Injectable()
export class NfcBridgeCommunicationService {
  private readonly logger = new Logger(NfcBridgeCommunicationService.name);

  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
      timeout: NodeJS.Timeout;
      clientId: string;
    }
  >();

  sendToBridge(
    bridgeClient: NfcClient | undefined,
    message: any,
  ): Promise<any> {
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

  sendToNfcBridge(
    bridgeClient: NfcClient | undefined,
    type: string,
    data: any,
    sendMessage: (ws: WebSocket, type: string, data: any) => void,
  ): Promise<any> {
    if (!bridgeClient) {
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
        clientId: bridgeClient.id,
      });

      sendMessage(bridgeClient.ws, type, {
        requestId,
        ...data,
      });
    });
  }

  handleOperationResponse(clientId: string, message: any) {
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const request = this.pendingRequests.get(message.requestId)!;
      clearTimeout(request.timeout);
      this.pendingRequests.delete(message.requestId);

      if (message.success !== false && message.type !== 'operation_error') {
        request.resolve(message.data || { success: true });
      } else {
        request.reject(new Error(message.error || 'Operation failed'));
      }
    }
  }

  cleanup() {
    this.pendingRequests.forEach((request) => {
      clearTimeout(request.timeout);
      request.reject(new Error('Service shutting down'));
    });
    this.pendingRequests.clear();
  }
}
