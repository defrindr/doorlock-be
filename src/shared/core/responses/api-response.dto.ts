import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'Action successful' })
  message: string;

  @ApiProperty({ required: false })
  data?: T | null;

  constructor(code: number, message: string, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
