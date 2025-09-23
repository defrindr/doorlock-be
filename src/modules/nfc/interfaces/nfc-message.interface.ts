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
  payload?: any;
  error?: string;
  success?: boolean;
  readers?: any[];
  timestamp?: string;
  bridgeId?: string;
  writeData?: any;
}
