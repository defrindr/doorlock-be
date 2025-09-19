import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CompanyDto {
  @ApiProperty({ description: 'Company ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Company name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Company address', nullable: true })
  @Expose()
  address?: string;

  @ApiProperty({ description: 'Company status' })
  @Expose()
  status: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  constructor(partial: Partial<CompanyDto>) {
    Object.assign(this, partial);
  }
}
