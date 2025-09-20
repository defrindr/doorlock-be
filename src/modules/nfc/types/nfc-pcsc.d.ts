declare module 'nfc-pcsc' {
  export interface Card {
    uid: string;
    atr: Buffer;
    standard: string;
    type: string;
  }

  export interface Reader {
    reader: any;
    name: string;
    card: Card | null;

    authenticate(
      blockNumber: number,
      keyType: number,
      key: Buffer,
    ): Promise<void>;
    read(
      blockNumber: number,
      length: number,
      blockSize?: number,
    ): Promise<Buffer>;
    write(blockNumber: number, data: Buffer, blockSize?: number): Promise<void>;

    on(event: 'card', listener: (card: Card) => void): void;
    on(event: 'card.off', listener: (card: Card) => void): void;
    on(event: 'error', listener: (err: Error) => void): void;
    on(event: 'end', listener: () => void): void;
  }

  export interface NFCEvents {
    on(event: 'reader', listener: (reader: Reader) => void): void;
    on(event: 'error', listener: (err: Error) => void): void;
  }

  export const KEY_TYPE_A: number;
  export const KEY_TYPE_B: number;

  export class NFC implements NFCEvents {
    constructor(options?: any);
    on(event: 'reader', listener: (reader: Reader) => void): void;
    on(event: 'error', listener: (err: Error) => void): void;
    close(): void;
  }

  export default NFC;
}
