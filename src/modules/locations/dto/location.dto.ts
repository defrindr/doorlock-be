import { ApiProperty } from '@nestjs/swagger';
import { LocationType } from '../entities/location-type.enum';
import { Exclude, Expose } from 'class-transformer';

export class LocationDto {
  @ApiProperty({
    description: 'Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Location name',
    example: 'Main Warehouse Jakarta',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Location type',
    enum: LocationType,
    example: LocationType.WAREHOUSE,
  })
  @Expose()
  type: LocationType;

  @ApiProperty({
    description: 'Location status (0=inactive, 1=active)',
    example: 1,
  })
  @Expose()
  status: number;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2023-12-25T08:00:00.000Z',
  })
  @Exclude()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2023-12-25T08:00:00.000Z',
  })
  @Exclude()
  updatedAt: Date;

  @ApiProperty({
    description: 'Deleted at timestamp (null if not deleted)',
    example: null,
    required: false,
  })
  @Exclude()
  deletedAt: Date | null;
}
