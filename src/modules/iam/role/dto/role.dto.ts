import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponsePermissionDto } from '../../permission/dto/response-permission.dto';

export class RoleDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description?: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => ResponsePermissionDto)
  permissions?: ResponsePermissionDto[];

  constructor(partial: Partial<RoleDto>) {
    Object.assign(this, partial);
  }
}
