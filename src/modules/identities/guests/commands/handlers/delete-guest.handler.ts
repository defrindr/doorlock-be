import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { DeleteGuestCommand } from '../imp/delete-guest.command';
import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import { Account } from '@src/modules/identities/entities/account.entity';
import { GuestImageService } from '../../services/guest-image.service';

@CommandHandler(DeleteGuestCommand)
export class DeleteGuestHandler
  extends BaseHandler<DeleteGuestCommand, ApiResponseDto<null>>
  implements ICommandHandler<DeleteGuestCommand, ApiResponseDto<null>>
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

  async handle(command: DeleteGuestCommand): Promise<ApiResponseDto<null>> {
    const { id } = command;

    const guest = await this.guestRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!guest) {
      throw new NotFoundHttpException('Guest not found');
    }

    // Clean up guest photo if exists
    if (guest.account && guest.account.photo) {
      // await this.guestImageService.cleanupGuestPhoto(guest.account);
    }

    // Soft delete guest and account
    await Promise.all([
      this.guestRepository.softDelete(id),
      guest.accountId
        ? this.accountRepository.softDelete(guest.accountId)
        : Promise.resolve(),
    ]);

    return OkResponse(null, 'Guest deleted successfully');
  }
}
