import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'Role name',
    example: 'admin',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  name: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Administrator role with full permissions',
    required: false,
  })
  @IsString()
  @Type(() => String)
  description?: string;

  @ApiPropertyOptional({
    description: 'List of permission IDs associated with the role',
    example: [],
    required: false,
    type: [String],
  })
  @IsArray()
  @Type(() => String)
  permissionIds?: string[];
}
