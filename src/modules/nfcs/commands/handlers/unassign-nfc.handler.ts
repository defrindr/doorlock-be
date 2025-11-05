import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { Account } from '@src/modules/identities/entities/account.entity';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { UnassignNfcCommand } from '../imp/unassign-nfc.command';
import { GateOccupant } from '@src/modules/histories/entities/gate-occupant.entity';

@CommandHandler(UnassignNfcCommand)
export class UnassignNfcHandler
  extends BaseHandler<UnassignNfcCommand, ApiResponseDto<null>>
  implements ICommandHandler<UnassignNfcCommand, ApiResponseDto<null>>
{
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(GateOccupant)
    private readonly gateOccupantRepository: Repository<GateOccupant>,
  ) {
    super();
  }

  async handle(command: UnassignNfcCommand): Promise<ApiResponseDto<null>> {
    const { accountId } = command;

    // Find account
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundHttpException('Account not found');
    }

    // Unassign NFC code from account
    await this.accountRepository.update(accountId, { nfcCode: null });

    // Remove from gate occupants when NFC card is unassigned
    await this.gateOccupantRepository.delete({ accountId });

    return OkResponse(null, 'NFC card unassigned successfully');
  }
}
