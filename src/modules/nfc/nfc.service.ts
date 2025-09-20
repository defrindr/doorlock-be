import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { NFC } from 'nfc-pcsc';
import { NfcOperationsService } from './services/nfc-operations.service';
import { NfcGateway } from './nfc.gateway';

@Injectable()
export class NfcService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NfcService.name);
  private nfc: NFC;

  constructor(
    private readonly gateway: NfcGateway,
    private readonly nfcOperations: NfcOperationsService,
  ) {}

  onModuleInit() {
    this.nfc = new NFC();
    this.nfc.on('reader', (reader: any) => {
      this.logger.log(`Reader connected: ${reader.name}`);

      reader.on('card', async (card: any) => {
        // Accept all card types, but log the type for debugging
        this.logger.debug(`Card detected: ${card.type}, UID: ${card.uid}`);

        try {
          const data = await this.nfcOperations.read({ reader });
          this.gateway.broadcast({ type: 'READ_RESULT', payload: data });
        } catch (err) {
          this.logger.error(`❌ Error reading NFC data: ${err.message}`);
        }
      });

      reader.on('card.off', (card: { uid: any }) => {
        this.gateway.broadcast({
          type: 'CARD_REMOVED',
          payload: { uid: card?.uid || null },
        });
      });

      reader.on('error', (err: { message: any }) => {
        this.gateway.broadcast({
          type: 'READER_ERROR',
          payload: { message: err.message },
        });
      });

      reader.on('end', () => {
        this.logger.warn(`Reader removed: ${reader.name}`);
        this.gateway.broadcast({
          type: 'READER_REMOVED',
          payload: { reader: reader.name },
        });
      });

      // Handle incoming WS messages
      this.gateway.onMessage(async (data: any) => {
        if (!reader.card) {
          this.gateway.broadcast({
            type: 'CARD_REMOVED',
            payload: { uid: null },
          });
          return;
        }

        this.logger.debug(
          `Processing message for card UID: ${reader.card.uid}`,
        );

        if (data?.type === 'REMOVE_CARD_DATA') {
          try {
            await this.nfcOperations.remove({ reader });
            this.gateway.broadcast({
              type: 'REMOVE_OK',
              payload: { message: 'Card data removed.' },
            });
          } catch (err) {
            this.gateway.broadcast({
              type: 'REMOVE_ERROR',
              payload: { message: err.message },
            });
          }
        }

        if (data?.type === 'WRITE_NDEF') {
          const accountId = data.payload.id;
          const payload = JSON.stringify({
            nip: 'tamu003',
            nama: 'Sutejo Kawulo',
            foto: 'ExamplePR060511-1-1.jpg',
            perusahaan: 'PT. Maju Mundur Asik',
            jabatan: 'Marketing',
            status_kartu: 'Tamu',
            poin: '5',
            aktif_mulai: '09-09-2025 00:00:01',
            aktif_selesai: '19-09-2025 21:00:00',
            access: '1',
          });
          console.log(accountId);
          try {
            await this.nfcOperations.remove({ reader });
            await new Promise((res) => setTimeout(res, 50));
            await this.nfcOperations.write({
              reader,
              value: payload,
            });
            this.gateway.broadcast({
              type: 'WRITE_OK',
              payload: { bytes: payload.length },
            });
          } catch (err) {
            this.gateway.broadcast({
              type: 'WRITE_ERROR',
              payload: { message: err.message },
            });
          }
        }
      });
    });

    this.nfc.on('error', (err: any) => {
      this.logger.error('NFC error', err);
    });
  }

  onModuleDestroy() {
    this.logger.log('Shutting down NFC service');
  }
}
