import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import { CreateGuestCommand } from '../imp/create-guest.command';
import { GuestDto } from '../../dto/guest.dto';
import {
  AccountType,
  IdentificationType,
} from '@src/modules/identities/entities/account-type.enum';
import {
  BadRequestHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { Account } from '@src/modules/identities/entities/account.entity';
import { GuestImageService } from '../../services/guest-image.service';
import { Company } from '@src/modules/master/companies/entities/company.entity';

@CommandHandler(CreateGuestCommand)
export class CreateGuestHandler
  extends BaseHandler<CreateGuestCommand, ApiResponseDto<GuestDto>>
  implements ICommandHandler<CreateGuestCommand, ApiResponseDto<GuestDto>>
{
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(AccountGuest)
    private readonly guestRepository: Repository<AccountGuest>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly guestImageService: GuestImageService,
  ) {
    super();
  }

  async handle(command: CreateGuestCommand): Promise<ApiResponseDto<GuestDto>> {
    const { createGuestDto } = command;

    // Validate Identity
    await Promise.all([
      this.validateIdentityCard(
        createGuestDto.identificationType,
        createGuestDto.identificationNumber,
      ),
      this.companyRepository
        .findOne({
          where: {
            id: createGuestDto.companyId,
          },
        })
        .then((res) => {
          if (!res) {
            throw new NotFoundHttpException("Company doesn't exists");
          }

          if (res.status === 0) {
            throw new BadRequestHttpException("Company doesn't active yet.");
          }
        }),
    ]);

    // Handle photo upload if provided
    const photoPath = await this.guestImageService.handlePhotoUpload(
      createGuestDto.photo,
    );

    delete createGuestDto.photo;
    // Create Account
    const status = createGuestDto.status;
    delete createGuestDto.status;
    const account = this.accountRepository.create({
      accountType: AccountType.GUEST,
      photo: photoPath,
      status: status,
    });
    const savedAccount = await this.accountRepository.save(account);

    const guest = this.guestRepository.create({
      ...createGuestDto,
      accountId: savedAccount.id,
    });
    const savedGuest = await this.guestRepository.save(guest);

    // Find the data
    const dto = await this.guestRepository.findOne({
      where: { id: savedGuest.id },
      relations: ['company', 'account'],
    });

    const guestDto = plainToInstance(GuestDto, dto, {
      excludeExtraneousValues: true,
    });

    return CreatedResponse(guestDto, 'Guest created successfully');
  }

  async validateIdentityCard(
    identificationType: IdentificationType,
    identificationNumber: string,
  ): Promise<void> {
    const existingGuest = await this.guestRepository.findOne({
      where: {
        identificationType,
        identificationNumber,
      },
    });

    if (existingGuest) {
      throw new BadRequestHttpException(
        'Guest already exists in our system, this is duplicated data',
      );
    }
  }
}
