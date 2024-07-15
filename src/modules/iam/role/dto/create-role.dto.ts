import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'admin',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  name: string;
}
