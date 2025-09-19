import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateLocationDto } from './create-location.dto';
import { LocationType } from '../entities/location-type.enum';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @ApiPropertyOptional({
    description: 'Location name',
    example: 'Updated Warehouse Name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Location type',
    enum: LocationType,
    example: LocationType.CROSSDOCK,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiPropertyOptional({
    description: 'Location status (0=inactive, 1=active)',
    example: 0,
  })
  @IsOptional()
  status?: number;
}
