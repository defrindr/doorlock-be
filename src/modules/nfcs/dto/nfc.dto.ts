import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NfcDto {
  @ApiProperty({ description: 'Nfc ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Nfc name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Nfc description', nullable: true })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Nfc status' })
  @Expose()
  status: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(partial: Partial<NfcDto>) {
    Object.assign(this, partial);
  }
}
