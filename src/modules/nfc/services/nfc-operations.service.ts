import { Injectable, Logger } from '@nestjs/common';
import { NfcReadService } from './nfc-read.service';
import { NfcWriteService } from './nfc-write.service';
import { NfcRemoveService } from './nfc-remove.service';
import {
  NfcReadParams,
  NfcReadResult,
  NfcWriteParams,
  NfcWriteResult,
  NfcRemoveParams,
  NfcRemoveResult,
} from '../interfaces/nfc.interface';

/**
 * Main NFC Service
 * Orchestrates all NFC operations
 */
@Injectable()
export class NfcOperationsService {
  private readonly logger = new Logger(NfcOperationsService.name);

  constructor(
    private readonly readService: NfcReadService,
    private readonly writeService: NfcWriteService,
    private readonly removeService: NfcRemoveService,
  ) {}

  /**
   * Read data from NFC card
   * @param params - Read parameters
   * @returns Promise<NfcReadResult>
   */
  async read(params: NfcReadParams): Promise<NfcReadResult> {
    this.logger.log(
      `Reading NFC card: ${params.reader.card?.uid || 'Unknown'}`,
    );
    return await this.readService.readNfcData(params);
  }

  /**
   * Write data to NFC card
   * @param params - Write parameters
   * @returns Promise<NfcWriteResult>
   */
  async write(params: NfcWriteParams): Promise<NfcWriteResult> {
    this.logger.log(
      `Writing to NFC card: ${params.reader.card?.uid || 'Unknown'}`,
    );
    return await this.writeService.writeNfcData(params);
  }

  /**
   * Remove data from NFC card
   * @param params - Remove parameters
   * @returns Promise<NfcRemoveResult>
   */
  async remove(params: NfcRemoveParams): Promise<NfcRemoveResult> {
    this.logger.log(
      `Removing data from NFC card: ${params.reader.card?.uid || 'Unknown'}`,
    );
    return await this.removeService.removeNfcData(params);
  }

  /**
   * Remove data from specific block range
   * @param params - Remove parameters
   * @param startBlock - Starting block
   * @param endBlock - Ending block
   * @returns Promise<NfcRemoveResult>
   */
  async removeRange(
    params: NfcRemoveParams,
    startBlock: number,
    endBlock: number,
  ): Promise<NfcRemoveResult> {
    this.logger.log(
      `Removing data range from NFC card: ${params.reader.card?.uid || 'Unknown'} (blocks ${startBlock}-${endBlock})`,
    );
    return await this.removeService.removeNfcDataRange(
      params,
      startBlock,
      endBlock,
    );
  }

  /**
   * Check if card has valid data
   * @param params - Read parameters
   * @returns Promise<boolean>
   */
  async hasData(params: NfcReadParams): Promise<boolean> {
    const result = await this.read(params);
    return (
      result.success && result.ndefHex !== null && result.ndefHex.length > 0
    );
  }

  /**
   * Get card information
   * @param params - Operation parameters
   * @returns Card information object
   */
  getCardInfo(params: NfcReadParams) {
    const card = params.reader.card;
    if (!card) {
      return null;
    }

    return {
      uid: card.uid,
      atr: card.atr?.toString('hex') || '',
      standard: card.standard || 'Unknown',
      type: card.type || 'Unknown',
    };
  }
}
