import { Injectable, Logger } from '@nestjs/common';
import {
  DEFAULT_KEY,
  WRITE_KEY_TYPE,
  START_BLOCK,
  BLOCK_SIZE,
  isSectorTrailer,
} from '../config/nfc.config';
import { jsonToBuffer } from '../utils/nfc.helper';
import {
  NfcWriteParams,
  NfcWriteResult,
  NfcWriteData,
} from '../interfaces/nfc.interface';

/**
 * NFC Write Service
 * Handles writing data to NFC cards
 */
@Injectable()
export class NfcWriteService {
  private readonly logger = new Logger(NfcWriteService.name);

  /**
   * Write data to NFC card
   * @param params - Write parameters
   * @returns Promise<NfcWriteResult>
   */
  async writeNfcData(params: NfcWriteParams): Promise<NfcWriteResult> {
    const { reader, value } = params;
    const card = reader.card;

    if (!card) {
      return {
        uid: '',
        success: false,
        error: 'No card present',
      };
    }

    this.logger.log('--- Start Write NFC Data ---');

    try {
      // Parse and prepare data
      const dataToWrite = this.prepareWriteData(value);
      const dataBuffer = jsonToBuffer(dataToWrite, BLOCK_SIZE);

      this.logger.log(`Writing ${dataBuffer.length} bytes to card`);

      let blockNumber = START_BLOCK;

      // Write data in 16-byte chunks
      for (let i = 0; i < dataBuffer.length; i += BLOCK_SIZE) {
        // Skip sector trailers
        if (isSectorTrailer(blockNumber)) {
          blockNumber++;
        }

        try {
          // Authenticate for write operation
          await reader.authenticate(blockNumber, WRITE_KEY_TYPE, DEFAULT_KEY);

          // Get the current chunk
          const chunk = dataBuffer.slice(i, i + BLOCK_SIZE);

          // Ensure chunk is exactly BLOCK_SIZE bytes
          const paddedChunk = Buffer.alloc(BLOCK_SIZE);
          chunk.copy(paddedChunk);

          // Write the chunk to the block
          await reader.write(blockNumber, paddedChunk, BLOCK_SIZE);

          this.logger.debug(`Written block ${blockNumber}`);
          blockNumber++;
        } catch (err) {
          this.logger.error(
            `Error writing block ${blockNumber}: ${err.message}`,
          );
          return {
            uid: card.uid,
            success: false,
            error: `Failed to write block ${blockNumber}: ${err.message}`,
          };
        }
      }

      this.logger.log('✅ Data written successfully');
      return {
        uid: card.uid,
        success: true,
      };
    } catch (err) {
      this.logger.error('A critical error occurred during write process:', err);
      return {
        uid: card?.uid || '',
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Prepare data for writing
   * @param value - Raw value to prepare
   * @returns Prepared data object
   */
  private prepareWriteData(value: string | NfcWriteData): NfcWriteData {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        this.logger.warn('Invalid JSON string provided, using as text');
        return { data: value };
      }
    }

    return value;
  }
}
