import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'Permission name',
    example: 'create-permission',
  })
  @IsNotEmpty()
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Create permission',
  })
  @Type(() => String)
  description?: string;
}
