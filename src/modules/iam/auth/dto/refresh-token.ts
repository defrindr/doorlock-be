import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh-t0ken',
    required: true,
    type: 'string',
  })
  @IsNotEmpty({ message: 'Refresh Token tidak boleh kosong' })
  @IsString()
  refreshToken: string;

  @ApiProperty({
    example: '',
    description: 'The fcm token used to login',
    required: false,
  })
  @IsString()
  fcmToken: string;
}
