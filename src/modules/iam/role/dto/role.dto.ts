import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty()
  @Expose()
  @Type(() => ResponsePermissionDto)
  permissions?: ResponsePermissionDto[];

  constructor(partial: Partial<RoleDto>) {
    Object.assign(this, partial);
  }
}
