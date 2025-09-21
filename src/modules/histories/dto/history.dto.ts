import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class HistoryDto {
  @ApiProperty({
    description: 'Unique identifier of the history record',
    example: '3F2504E0-4F89-11D3-9A0C-0305E82C3301',
  })
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Account ID associated with this history',
    example: '9F8E7D6C-5B4A-3C2D-1E0F-1234567890AB',
  })
  @IsUUID()
  @Expose()
  accountId: string;

  @ApiProperty({
    description: 'Account identifier, e.g., NIP or employee number',
    example: '1000123',
  })
  @IsString()
  @IsNotEmpty()
  @Expose()
  accountIdentifier: string;

  @ApiProperty({
    description: 'Account name (optional)',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  accountName?: string;

  @ApiProperty({
    description: 'Gate identifier (e.g., door number)',
    example: 1,
  })
  @IsNumber()
  @Expose()
  gateIdentifier: number;

  @ApiProperty({
    description: 'Gate ID associated with this history',
    example: '7E8F9A0B-1C2D-3E4F-5G6H-789012345678',
  })
  @IsUUID()
  @Expose()
  gateId: string;

  @ApiProperty({
    description: 'Gate name (optional)',
    example: 'Main Entrance',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Expose()
  gateName?: string;

  @ApiProperty({
    description: 'UID of the card tapped',
    example: 'A301B127',
  })
  @IsString()
  @Expose()
  cardUid: string;

  @ApiProperty({
    description: 'Company name associated with the account',
    example: 'PT. Maju Mundur Asik',
  })
  @IsString()
  @Expose()
  companyName: string;

  @ApiProperty({
    description: 'Status of the action',
    example: 'success',
  })
  @IsString()
  @Expose()
  status: 'success' | 'denied';

  @ApiProperty({
    description: 'Message describing the result of the action',
    example: 'BERHASIL MASUK',
  })
  @IsString()
  @Expose()
  message: string;

  @ApiProperty({
    description: 'Additional details (optional)',
    example: '{"ip":"192.168.1.1"}',
    required: false,
  })
  @IsString()
  @IsOptional()
  // @Transform(({ value }) => (value ? JSON.parse(value) : undefined))
  // @Expose()
  moreDetails?: any;

  @ApiProperty({
    description: 'Timestamp when the card was tapped',
    example: '2025-09-21T08:15:54.000Z',
  })
  @IsDate()
  @Expose()
  timestamp: Date;

  @ApiProperty({
    description: 'Timestamp when this record was synced to the server',
    example: '2025-09-21T08:16:10.000Z',
  })
  @IsDate()
  @Expose()
  syncAt: Date;
}
