import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponsePermissionDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  constructor(partial: Partial<ResponsePermissionDto>) {
    Object.assign(this, partial);
  }
}
