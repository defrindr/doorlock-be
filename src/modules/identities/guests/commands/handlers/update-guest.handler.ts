import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { UpdateGuestCommand } from '../imp/update-guest.command';
import { GuestDto } from '../../dto/guest.dto';
import { Account } from '@src/modules/identities/entities/account.entity';
import { GuestImageService } from '../../services/guest-image.service';

@CommandHandler(UpdateGuestCommand)
export class UpdateGuestHandler
  extends BaseHandler<UpdateGuestCommand, ApiResponseDto<GuestDto>>
  implements ICommandHandler<UpdateGuestCommand, ApiResponseDto<GuestDto>>
{
  constructor(
    @InjectRepository(AccountGuest)
    private readonly guestRepository: Repository<AccountGuest>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly guestImageService: GuestImageService,
  ) {
    super();
  }

  async handle(command: UpdateGuestCommand): Promise<ApiResponseDto<GuestDto>> {
    const { id, updateGuestDto } = command;

    // Check Guest Data
    const [guest] = await Promise.all([
      this.guestRepository.findOne({ where: { id } }),
    ]);
    if (!guest) {
      throw new NotFoundHttpException('Guest not found');
    }

    // Check Account Data
    const account = await this.accountRepository.findOne({
      where: { id: guest.accountId },
    });
    if (!account) {
      throw new NotFoundHttpException('Account not found');
    }

    // Handle photo update if provided
    const photoPath = await this.guestImageService.handlePhotoUpdate(
      updateGuestDto.photo,
      account.photo,
    );
    const status = updateGuestDto.status;

    delete updateGuestDto.photo;
    delete updateGuestDto.status;
    // Update Data
    await Promise.all([
      // Update Guest
      this.guestRepository.update(id, {
        ...updateGuestDto,
      }),
      // Update Account
      this.accountRepository.update(guest.accountId, {
        status: status,
      }),
      // Update Account photo if new photo was uploaded
      this.guestImageService.updateAccountPhoto(guest.accountId, photoPath),
    ]);

    const updatedGuest = await this.guestRepository.findOne({
      where: { id },
      relations: ['account', 'company'],
    });

    const guestDto = plainToInstance(GuestDto, updatedGuest, {
      excludeExtraneousValues: true,
    });

    return OkResponse(guestDto, 'Guest updated successfully');
  }
}
