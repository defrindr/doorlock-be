import { ApiProperty } from '@nestjs/swagger';
import { HistoryDto } from '@src/modules/histories/dto/history.dto';
import { Expose, Type } from 'class-transformer';
import { PeopleInGateDto } from './people-in-gates.dto';

export class DashboardDto {
  @ApiProperty({
    description: 'Total number of employees in the system',
    example: 150,
    type: Number,
  })
  @Expose()
  employeeCount: number;

  @ApiProperty({
    description: 'Total number of gates in the system',
    example: 25,
    type: Number,
  })
  @Expose()
  gateCount: number;

  @ApiProperty({
    description: 'Number of successful tap-in events',
    example: 1250,
    type: Number,
  })
  @Expose()
  tapInEmployee: number;

  @ApiProperty({
    description: 'Number of failed tap-in events',
    example: 45,
    type: Number,
  })
  @Expose()
  tapInGuest: number;

  @ApiProperty({
    description: 'List of recent tap-in history records',
    type: [HistoryDto],
  })
  @Type(() => HistoryDto)
  @Expose()
  tapInList: HistoryDto[];

  @ApiProperty({
    description: 'List of people count per gate',
    type: [PeopleInGateDto],
  })
  @Type(() => PeopleInGateDto)
  @Expose()
  peopleInGates: PeopleInGateDto[];
}
