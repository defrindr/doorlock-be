import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OccupantDto {
  @ApiProperty({
    description: 'Person name',
    example: 'Chandra Bahari',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Identity Card',
    example: '1010101010101010',
    type: String,
  })
  @Expose()
  identifier: string;

  @ApiProperty({
    description: 'Company Name',
    example: 'PT Permana Adi Luhung',
    type: String,
  })
  @Expose()
  companyName: string;
}
