import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

export class LoginResponseDto {
  @ApiProperty()
  user: UserDto;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  expiredAt: number;
}
