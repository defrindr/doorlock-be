import { Injectable, Logger } from '@nestjs/common';
import {
  DEFAULT_KEY,
  READ_KEY_TYPE,
  TOTAL_BLOCKS,
  isSectorTrailer,
  getSectorNumber,
} from '../config/nfc.config';
import { trimBuffer } from '../utils/nfc.helper';
import {
  NfcReadParams,
  NfcReadResult,
  AuthenticationResult,
} from '../interfaces/nfc.interface';

/**
 * NFC Read Service
 * Handles reading data from NFC cards
 */
@Injectable()
export class NfcReadService {
  private readonly logger = new Logger(NfcReadService.name);

  /**
   * Read NFC data from card
   * @param params - Read parameters
   * @returns Promise<NfcReadResult>
   */
  async readNfcData(params: NfcReadParams): Promise<NfcReadResult> {
    const { reader } = params;
    const card = reader.card;

    if (!card) {
      return {
        uid: '',
        ndefHex: null,
        success: false,
        error: 'No card present',
      };
    }

    this.logger.log('--- Start Read NFC Data ---');

    let authenticatedSector = -1;
    const allDataBlocks: Buffer[] = [];

    try {
      // Start reading from block 4 where NDEF data typically begins
      for (let blockNumber = 4; blockNumber < TOTAL_BLOCKS; blockNumber++) {
        // Skip sector trailers to avoid access control issues
        if (isSectorTrailer(blockNumber)) {
          continue;
        }

        const currentSector = getSectorNumber(blockNumber);

        try {
          // Authenticate when entering a new sector
          const authResult = await this.authenticateIfNeeded(
            reader,
            blockNumber,
            currentSector,
            authenticatedSector,
          );

          if (!authResult.authenticated) {
            this.logger.warn(
              `Failed to authenticate sector ${currentSector}: ${authResult.error}`,
            );
            break;
          }

          authenticatedSector = authResult.sector;

          // Read 16 bytes from the block
          const data = await reader.read(blockNumber, 16, 16);

          // Stop if we encounter empty data (terminator)
          if (data[0] === 0) {
            this.logger.log(
              `Terminator found at block ${blockNumber}. Stopping read.`,
            );
            break;
          }

          allDataBlocks.push(data);
        } catch (err) {
          this.logger.error(
            `Error reading block ${blockNumber}: ${err.message}`,
          );
          break;
        }
      }

      if (allDataBlocks.length === 0) {
        this.logger.warn('No data blocks were read from the card.');
        return {
          uid: card.uid,
          ndefHex: null,
          success: true,
        };
      }

      // Concatenate all data blocks
      const fullData = Buffer.concat(allDataBlocks);
      this.logger.log(`Total raw data read: ${fullData.length} bytes.`);

      // Trim trailing zeros
      const trimmedData = trimBuffer(fullData);

      if (trimmedData.length > 0) {
        this.logger.log('✅ NDEF message found!');
        return {
          uid: card.uid,
          ndefHex: trimmedData.toString('hex'),
          success: true,
        };
      } else {
        this.logger.warn(
          'Could not find a valid NDEF message in the card data.',
        );
        return {
          uid: card.uid,
          ndefHex: null,
          success: true,
        };
      }
    } catch (err) {
      this.logger.error(
        'A critical error occurred during the read process:',
        err,
      );
      return {
        uid: card?.uid || '',
        ndefHex: null,
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Authenticate reader for a sector if needed
   */
  private async authenticateIfNeeded(
    reader: any,
    blockNumber: number,
    currentSector: number,
    authenticatedSector: number,
  ): Promise<AuthenticationResult> {
    if (currentSector === authenticatedSector) {
      return {
        sector: authenticatedSector,
        authenticated: true,
      };
    }

    try {
      await reader.authenticate(blockNumber, READ_KEY_TYPE, DEFAULT_KEY);
      this.logger.debug(`Authenticated for sector ${currentSector}`);
      return {
        sector: currentSector,
        authenticated: true,
      };
    } catch (error) {
      return {
        sector: currentSector,
        authenticated: false,
        error: error.message,
      };
    }
  }
}
