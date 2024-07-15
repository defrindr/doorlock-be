import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRolePermissionDto {
  @ApiProperty({
    description: 'Role id',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  roleId: number;

  @ApiProperty({
    description: 'Permission id',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @Type(() => Number)
  permissionId: number;
}
