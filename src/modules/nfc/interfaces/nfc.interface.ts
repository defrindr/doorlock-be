import { Reader } from 'nfc-pcsc';

/**
 * NFC Operation Interfaces
 * Contains interfaces for NFC operations and responses
 */

/**
 * NFC Read result
 */
export interface NfcReadResult {
  uid: string;
  ndefHex: string | null;
  success: boolean;
  error?: string;
}

/**
 * NFC Write data
 */
export interface NfcWriteData {
  [key: string]: any;
}

/**
 * NFC Write result
 */
export interface NfcWriteResult {
  uid: string;
  success: boolean;
  error?: string;
}

/**
 * NFC Remove result
 */
export interface NfcRemoveResult {
  uid: string;
  success: boolean;
  error?: string;
}

/**
 * NFC Operation parameters
 */
export interface NfcOperationParams {
  reader: Reader;
}

/**
 * NFC Read parameters
 */
export interface NfcReadParams extends NfcOperationParams {}

/**
 * NFC Write parameters
 */
export interface NfcWriteParams extends NfcOperationParams {
  value: string | NfcWriteData;
}

/**
 * NFC Remove parameters
 */
export interface NfcRemoveParams extends NfcOperationParams {}

/**
 * Authentication result
 */
export interface AuthenticationResult {
  sector: number;
  authenticated: boolean;
  error?: string;
}
