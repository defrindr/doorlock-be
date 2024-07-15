import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission name',
    example: 'create-permission',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Permission description',
    example: 'Create permission',
    required: true,
  })
  @IsNotEmpty()
  @Type(() => String)
  description: string;
}
