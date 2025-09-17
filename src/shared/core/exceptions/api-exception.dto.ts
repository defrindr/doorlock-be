import { ApiProperty } from '@nestjs/swagger';

export class ApiExceptionDto {
  @ApiProperty({ example: 400 })
  code: number;

  @ApiProperty({ example: 'Bad Request' })
  message: string;
}
