import { KEY_TYPE_A, KEY_TYPE_B } from 'nfc-pcsc';

/**
 * NFC Configuration Constants
 * Contains all configuration values for MIFARE Classic card operations
 */

// TLV (Tag-Length-Value) identifiers
export const TLV_NDEF = 0x03; // NDEF Message
export const TLV_TERMINATOR = 0xfe;

// MIFARE Classic authentication keys
// This is the standard public key for MIFARE Classic cards formatted with NDEF data
export const DEFAULT_KEY = Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

// Key types for authentication
export const READ_KEY_TYPE = KEY_TYPE_A;
export const WRITE_KEY_TYPE = KEY_TYPE_B;

// Block configuration
export const START_BLOCK = 4; // NDEF data typically starts at block 4
export const TOTAL_BLOCKS = 64; // MIFARE Classic 1K has 64 blocks
export const BLOCK_SIZE = 16; // Each block is 16 bytes
export const EMPTY_BLOCK = Buffer.alloc(16); // A 16-byte buffer of zeros

// Sector configuration
export const BLOCKS_PER_SECTOR = 4;
export const SECTOR_TRAILER_OFFSET = 3; // Last block of each sector (relative to sector start)

/**
 * Check if a block number is a sector trailer
 * Sector trailers should not be written to as they contain access keys
 */
export const isSectorTrailer = (blockNumber: number): boolean => {
  return (blockNumber + 1) % BLOCKS_PER_SECTOR === 0;
};

/**
 * Get sector number from block number
 */
export const getSectorNumber = (blockNumber: number): number => {
  return Math.floor(blockNumber / BLOCKS_PER_SECTOR);
};

/**
 * NFC Configuration Interface
 */
export interface NfcConfig {
  key: Buffer;
  readKeyType: number;
  writeKeyType: number;
  startBlock: number;
  totalBlocks: number;
  blockSize: number;
}

/**
 * Default NFC configuration
 */
export const defaultNfcConfig: NfcConfig = {
  key: DEFAULT_KEY,
  readKeyType: READ_KEY_TYPE,
  writeKeyType: WRITE_KEY_TYPE,
  startBlock: START_BLOCK,
  totalBlocks: TOTAL_BLOCKS,
  blockSize: BLOCK_SIZE,
};
