import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PeopleInGateDto {
  @ApiProperty({
    description: 'Gate ID',
    example: 'uuid-string',
  })
  @Expose()
  gateId: string;

  @ApiProperty({
    description: 'Gate name',
    example: 'Main Entrance',
  })
  @Expose()
  gateName: string;

  @ApiProperty({
    description: 'Number of people currently in this gate',
    example: 5,
  })
  @Expose()
  count: number;
}
