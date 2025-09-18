import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserRoleDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description?: string;

  constructor(partial: Partial<UserRoleDto>) {
    Object.assign(this, partial);
  }
}
