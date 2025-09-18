import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { GateType } from '../entities/gate-type.enum';

export class GateDto {
  @ApiProperty({
    description: 'Gate ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Gate name',
    example: 'Main Gate A',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Location ID where the gate is located',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  locationId: string;

  @ApiProperty({
    description: 'Gate status (0: inactive, 1: active)',
    example: 1,
  })
  @Expose()
  status: number;

  @ApiProperty({
    description: 'Gate type',
    enum: GateType,
    example: GateType.PHYSICAL,
  })
  @Expose()
  type: GateType;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00Z',
  })
  @Exclude()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00Z',
  })
  @Exclude()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: Date;

  @ApiProperty({
    description: 'Location details',
    required: false,
  })
  @Expose()
  location?: {
    id: string;
    name: string;
    type: string;
  };
}
