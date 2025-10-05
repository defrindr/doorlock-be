import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class SyncParticipantGatesDto {
  @ApiProperty({
    description: 'List of gate IDs to assign to the visit participant',
    example: [
      'A1E2C3D4-5678-90AB-CDEF-1234567890AB',
      'B1E2C3D4-5678-90AB-CDEF-1234567890AB',
    ],
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('all', { each: true })
  gateIds: string[];
}
