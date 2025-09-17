import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'Permission name',
    example: 'create-permission',
  })
  @Type(() => String)
  name?: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Create permission',
  })
  @Type(() => String)
  description?: string;
}
