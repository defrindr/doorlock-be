import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AccountType } from '../entities/account-type.enum';
import { GuestDto } from '../guests/dto/guest.dto';

export class AccountDto {
  @ApiProperty({
    description: 'Account Unique Identifier',
    example: '80DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'NFC card code for access control identification',
    example: 'NFC001234567890',
  })
  @Expose()
  nfcCode: string;

  @ApiProperty({
    description: 'URL or path to the user photo/profile picture',
    example: '/uploads/photos/user-photo.jpg',
  })
  @Expose()
  photo: string;

  @ApiProperty({
    description: 'Additional details or notes about the account holder',
    example: 'VIP guest, requires special access permissions',
  })
  @Expose()
  moreDetails: string;

  @ApiProperty({
    description: 'Type of account (employee, intern, or guest)',
    enum: AccountType,
    example: AccountType.GUEST,
  })
  @Expose()
  accountType: AccountType;

  @ApiProperty({
    description: 'Account status (0 = inactive, 1 = active)',
    example: 1,
  })
  @Expose()
  status: number;

  @ApiProperty({
    description: 'Detail account information, when accountType is guest',
    type: () => GuestDto,
    required: false,
  })
  @Type(() => GuestDto)
  @Expose()
  guest?: GuestDto;

  @ApiProperty({
    description: 'Detail account information, when accountType is guest',
    type: () => GuestDto,
    required: false,
  })
  @Type(() => GuestDto)
  @Expose()
  employee?: GuestDto;

  constructor(partial: Partial<AccountDto>) {
    Object.assign(this, partial);
  }
}
