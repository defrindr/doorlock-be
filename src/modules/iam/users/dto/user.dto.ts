import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserRoleDto } from './user-role.dto';

export class UserDto {
  @ApiProperty()
  @Expose()
  public id: string;

  @ApiProperty()
  @Expose()
  public username: string;

  @ApiProperty()
  @Expose()
  public name: string;

  @ApiProperty()
  @Expose()
  public phone?: string;

  @ApiProperty()
  @Expose()
  public email?: string;

  @ApiProperty()
  @Expose()
  public photoUrl?: string;

  @ApiProperty()
  @Expose()
  public roleId: string;

  @ApiPropertyOptional()
  @Expose()
  @Type(() => UserRoleDto)
  public role?: UserRoleDto;

  @ApiPropertyOptional()
  @Expose()
  public permissions?: string[];

  @ApiProperty()
  @Expose()
  public status: 'active' | 'inactive';

  @ApiProperty()
  @Expose()
  public createdAt: Date;

  @ApiProperty()
  @Expose()
  public updatedAt: Date;
}
