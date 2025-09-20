import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class VisitActionResponseDto {
  @ApiProperty({
    description: 'Visit Unique Identifier',
    example: '76DE423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  id: string;

  constructor(partial: Partial<VisitActionResponseDto>) {
    Object.assign(this, partial);
  }
}
