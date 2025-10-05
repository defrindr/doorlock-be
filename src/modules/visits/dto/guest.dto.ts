import { ApiProperty } from '@nestjs/swagger';
import { IdentificationType } from '@src/modules/identities/entities/account-type.enum';
import { CompanyDto } from '@src/modules/master/companies/dto/company.dto';
import { Expose, Type } from 'class-transformer';
import { GateDto } from './gate.dto';

export class GuestDto {
  @ApiProperty({
    description: 'Guest Unique Identifier',
    example: '80DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Guest full name', example: 'Example Guest' })
  @Expose()
  fullName: string;

  @ApiProperty({
    description: 'Company ID related to Guest',
    example: '80DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  companyId: string;

  @ApiProperty({
    description: 'Guest email for contact information',
    example: 'guest@ckb.co.id',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Guest phone for contact information',
    example: '628577812748',
  })
  @Expose()
  phone: string;

  @ApiProperty({
    description: 'Guest identification type',
    example: 'KTP',
  })
  @Expose()
  identificationType: IdentificationType;

  @ApiProperty({
    description: 'Information related to identification type',
    example: '32123568478394',
  })
  @Expose()
  identificationNumber: string;

  @ApiProperty({
    description: 'Guest Company information',
  })
  @Type(() => CompanyDto)
  @Expose()
  company: CompanyDto;

  @ApiProperty({
    description: 'Photo URL of the guest',
  })
  @Expose()
  photoUrl?: string;

  @ApiProperty({
    description: 'List of gates can access by guest in the visit',
    type: () => [GateDto],
  })
  @Type(() => GateDto)
  @Expose()
  accesses?: GateDto[];

  constructor(partial: Partial<GuestDto>) {
    Object.assign(this, partial);
  }
}
