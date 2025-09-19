import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IdentificationType } from '../../entities/account-type.enum';

export class UpdateGuestDto {
  @ApiPropertyOptional({
    description: 'Guest full name',
    example: 'Example Guest',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({
    description: 'Company ID related to Guest',
    example: '1234-1234-1234-1234-1234',
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

  @ApiPropertyOptional({
    description: 'Guest identification type',
    example: 'KTP',
  })
  @IsEnum(IdentificationType, {
    message: `identification_type must be one of: ${Object.values(IdentificationType).join(', ')}`,
  })
  @IsNotEmpty()
  identificationType: IdentificationType;

  @ApiPropertyOptional({
    description: 'Information related to identification type',
    example: '32123568478394',
  })
  @IsNotEmpty()
  identificationNumber: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Guest picture (image upload)',
  })
  @ValidateIf(() => false)
  photo: any;
}
