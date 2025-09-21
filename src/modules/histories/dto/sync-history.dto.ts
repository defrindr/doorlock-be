import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class SyncHistoryDto {
  @ApiProperty({
    description: 'API key provided by the device',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  API_KEY: string;

  @ApiProperty({
    description: 'UID of the card tapped',
    example: 'A301B127',
  })
  @IsString()
  @IsNotEmpty()
  UID: string;

  @ApiProperty({
    description: 'Gate identifier or door number',
    example: '1',
  })
  @IsNumber()
  @IsNotEmpty()
  pintu: number;

  @ApiProperty({
    description: 'Unix timestamp of when the card was tapped',
    example: 1756890554,
  })
  @IsNumber()
  @IsNotEmpty()
  jam_tap: number;

  @ApiProperty({
    description: 'Action result from the door system (success or denied)',
    example: 'success',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Message from the device describing the action',
    example: 'BERHASIL MASUK',
  })
  @IsString()
  @IsNotEmpty()
  pesan: string;

  @ApiProperty({
    description: 'NIP or identifier of the cardholder, "-" if unknown',
    example: '1000123',
  })
  @IsString()
  @IsNotEmpty()
  nip: string;

  @ApiProperty({
    description: 'Account ID, that for identified the account valid or not',
    example: '37E1423E-F36B-1410-88E6-00BD8D009321',
  })
  @IsString()
  @IsNotEmpty()
  id_akun: string;
}
