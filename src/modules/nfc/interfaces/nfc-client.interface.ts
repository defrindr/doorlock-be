import { WebSocket } from 'ws';

export interface NfcClient {
  id: string;
  type: 'frontend' | 'nfc_bridge';
  ws: WebSocket;
  bridgeId?: string;
  readers?: string[];
  lastHeartbeat?: Date;
}
