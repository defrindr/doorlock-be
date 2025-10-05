import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import { AccountIntern } from '@src/modules/identities/entities/account-intern.entity';
import { AccountType } from '@src/modules/identities/entities/account-type.enum';
import { Account } from '@src/modules/identities/entities/account.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { DateHelper } from '@src/shared/utils/date-helper';
import { History } from '../../entities/history.entity';
import { SyncHistoryCommand } from '../imp/sync-history.command';

@CommandHandler(SyncHistoryCommand)
export class SyncHistoryHandler
  extends BaseHandler<SyncHistoryCommand, ApiResponseDto>
  implements ICommandHandler<SyncHistoryCommand, ApiResponseDto>
{
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
    @InjectRepository(AccountGuest)
    private readonly guestRepository: Repository<AccountGuest>,
    @InjectRepository(AccountEmployee)
    private readonly employeeRepository: Repository<AccountEmployee>,
    @InjectRepository(AccountIntern)
    private readonly internRepository: Repository<AccountIntern>,
  ) {
    super();
  }

  async handle(command: SyncHistoryCommand): Promise<ApiResponseDto> {
    const { syncHistoriesDto } = command;

    const accountIds = syncHistoriesDto.map((history) => history.id_akun);
    const gateIdentifierIds = syncHistoriesDto.map((history) => history.pintu);

    let accounts: any = [];
    let gates: any = [];
    try {
      accounts = await this.accountRepository.find({
        where: { id: In(accountIds) },
      });
    } catch (error) {
      accounts = [];
    }
    try {
      gates = await this.gateRepository.find({
        where: { gateIdentifier: In(gateIdentifierIds) },
      });
    } catch (error) {
      gates = [];
    }

    const dtos: History[] = [];
    for (const history of syncHistoriesDto) {
      const dto = this.historyRepository.create({});

      // Skip duplicate data
      const checkDuplicate = await this.historyRepository.findOne({
        where: {
          timestamp: DateHelper.fromUnix(history.jam_tap),
          cardUid: history.UID,
        },
      });
      if (checkDuplicate) continue;

      let selectedAccount: any = accounts.filter(
        (account: any) => account.id === history.id_akun,
      )?.[0];
      if (!selectedAccount) {
        selectedAccount = { id: null };
      }

      const selectedGate = gates.filter(
        (gate: any) => Number(gate.gateIdentifier) === Number(history.pintu),
      )?.[0];
      if (!selectedGate) {
        throw new BadRequestHttpException('Gate not exists');
      }

      dto.accountId = selectedAccount.id;
      dto.accountIdentifier = history.nip;
      dto.cardUid = history.UID;
      dto.gateId = selectedGate.id;
      dto.gateIdentifier = selectedGate.gateIdentifier;
      dto.gateName = selectedGate.name;
      dto.message = history.pesan;
      dto.moreDetails = JSON.stringify(history);
      dto.status = history.status as 'success' | 'denied';
      dto.timestamp = DateHelper.fromUnix(history.jam_tap);

      switch (selectedAccount.accountType) {
        case AccountType.EMPLOYEE:
          const employee = await this.employeeRepository.findOne({
            where: { accountId: selectedAccount.id },
          });
          if (!employee) {
            throw new BadRequestHttpException('Employee not exists');
          }
          dto.accountName = employee.fullName;
          dto.companyName = 'CKB Logistics'; // * Currently static for employee
          break;
        case AccountType.GUEST:
          const guest = await this.guestRepository.findOne({
            where: { accountId: selectedAccount.id },
            relations: ['company'],
          });
          if (!guest) {
            throw new BadRequestHttpException('Guest not exists');
          }
          dto.accountName = guest.fullName;
          dto.companyName = guest.company.name || '-';
          break;
        case AccountType.INTERN:
          const intern = await this.internRepository.findOne({
            where: { accountId: selectedAccount.id },
          });
          if (!intern) {
            throw new BadRequestHttpException('Intern not exists');
          }
          dto.accountName = intern.fullName;
          dto.companyName = intern.university;
          break;
        default:
          dto.accountName = '-';
          dto.companyName = '-';
      }

      dtos.push(dto);
    }

    // save dtos
    await this.historyRepository.save(dtos);

    return CreatedResponse(null, 'History created successfully');
  }
}
