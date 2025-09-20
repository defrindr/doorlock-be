import { Injectable, Logger } from '@nestjs/common';
import {
  DEFAULT_KEY,
  WRITE_KEY_TYPE,
  TOTAL_BLOCKS,
  EMPTY_BLOCK,
  isSectorTrailer,
  getSectorNumber,
} from '../config/nfc.config';
import { NfcRemoveParams, NfcRemoveResult } from '../interfaces/nfc.interface';

/**
 * NFC Remove Service
 * Handles removing/clearing data from NFC cards
 */
@Injectable()
export class NfcRemoveService {
  private readonly logger = new Logger(NfcRemoveService.name);

  /**
   * Remove all data from NFC card
   * @param params - Remove parameters
   * @returns Promise<NfcRemoveResult>
   */
  async removeNfcData(params: NfcRemoveParams): Promise<NfcRemoveResult> {
    const { reader } = params;
    const card = reader.card;

    if (!card) {
      return {
        uid: '',
        success: false,
        error: 'No card present',
      };
    }

    this.logger.log('--- Start Remove NFC Data ---');

    let authenticatedSector = -1;

    try {
      // Clear data blocks (skip block 0 to preserve manufacturer data)
      for (let blockNumber = 1; blockNumber < TOTAL_BLOCKS; blockNumber++) {
        // Skip sector trailers to avoid locking the card
        if (isSectorTrailer(blockNumber)) {
          continue;
        }

        const currentSector = getSectorNumber(blockNumber);

        try {
          // Authenticate when entering a new sector
          if (currentSector !== authenticatedSector) {
            await reader.authenticate(blockNumber, WRITE_KEY_TYPE, DEFAULT_KEY);
            authenticatedSector = currentSector;
            this.logger.debug(`Authenticated for sector ${currentSector}`);
          }

          // Write empty block to clear data
          await reader.write(blockNumber, EMPTY_BLOCK, 16);
          this.logger.debug(`Cleared block ${blockNumber}`);
        } catch (err) {
          this.logger.error(
            `Error clearing block ${blockNumber}: ${err.message}`,
          );
          // Continue with other blocks even if one fails
        }
      }

      this.logger.log('✅ Data removed successfully');
      return {
        uid: card.uid,
        success: true,
      };
    } catch (err) {
      this.logger.error(
        'A critical error occurred during remove process:',
        err,
      );
      return {
        uid: card?.uid || '',
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Remove data from specific blocks
   * @param params - Remove parameters
   * @param startBlock - Starting block number
   * @param endBlock - Ending block number
   * @returns Promise<NfcRemoveResult>
   */
  async removeNfcDataRange(
    params: NfcRemoveParams,
    startBlock: number,
    endBlock: number,
  ): Promise<NfcRemoveResult> {
    const { reader } = params;
    const card = reader.card;

    if (!card) {
      return {
        uid: '',
        success: false,
        error: 'No card present',
      };
    }

    this.logger.log(
      `--- Start Remove NFC Data Range (${startBlock}-${endBlock}) ---`,
    );

    let authenticatedSector = -1;

    try {
      for (
        let blockNumber = startBlock;
        blockNumber <= endBlock;
        blockNumber++
      ) {
        // Skip sector trailers
        if (isSectorTrailer(blockNumber)) {
          continue;
        }

        const currentSector = getSectorNumber(blockNumber);

        try {
          // Authenticate when entering a new sector
          if (currentSector !== authenticatedSector) {
            await reader.authenticate(blockNumber, WRITE_KEY_TYPE, DEFAULT_KEY);
            authenticatedSector = currentSector;
          }

          // Clear the block
          await reader.write(blockNumber, EMPTY_BLOCK, 16);
        } catch (err) {
          this.logger.error(
            `Error clearing block ${blockNumber}: ${err.message}`,
          );
        }
      }

      this.logger.log('✅ Data range removed successfully');
      return {
        uid: card.uid,
        success: true,
      };
    } catch (err) {
      this.logger.error(
        'A critical error occurred during range remove process:',
        err,
      );
      return {
        uid: card?.uid || '',
        success: false,
        error: err.message,
      };
    }
  }
}
