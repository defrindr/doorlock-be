import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { IdentificationType } from '../../entities/account-type.enum';

export class CreateGuestDto {
  @ApiProperty({ description: 'Guest full name', example: 'Example Guest' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    description: 'Company ID related to Guest',
    example: '80DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiPropertyOptional({
    description: 'Guest email for contact information',
    example: 'guest@ckb.co.id',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Guest phone for contact information',
    example: '628577812748',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Guest identification type',
    enum: IdentificationType,
    example: IdentificationType.KTP, // → "ktp"
  })
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(IdentificationType, {
    message: `identification_type must be one of: ${Object.values(IdentificationType).join(', ')}`,
  })
  @IsNotEmpty()
  identificationType: IdentificationType;

  @ApiProperty({
    description: 'Information related to identification type',
    example: '32123568478394',
  })
  @IsNotEmpty()
  identificationNumber: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Guest picture (image upload)',
  })
  // @ValidateIf(() => false)
  photo: any;
}
