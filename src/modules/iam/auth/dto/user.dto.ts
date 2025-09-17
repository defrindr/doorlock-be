import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserDto {
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
  public fcmToken?: string;

  @ApiProperty()
  @Exclude()
  public refreshToken?: string;

  @ApiProperty()
  @Expose()
  public photoUrl?: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
