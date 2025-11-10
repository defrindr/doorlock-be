import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';
import { DataSource, EntityManager, In } from 'typeorm';

import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import {
  AccountType,
  getIdentificationTypes,
} from '@src/modules/identities/entities/account-type.enum';
import { Account } from '@src/modules/identities/entities/account.entity';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import { VisitDto } from '../../dto/visit.dto';
import { VisitParticipant } from '../../entities/visit-participant.entity';
import { Visit } from '../../entities/visit.entity';
import { ImportVisitCommand } from '../imp/import-visit.command';
import { VisitGate } from '../../entities/visit-gate.entity';
import { VisitGuestGate } from '../../entities/visit-guest-gate.entity';

interface ExcelVisitData {
  companyName: string;
  purpose: string;
  startDate: string;
  endDate: string;
  gates: string;
  participants: Array<{
    name: string;
    email: string;
    phone: string;
    idType: string;
    idNumber: string;
  }>;
}

interface ImportVisitResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  data: VisitDto[];
}

@CommandHandler(ImportVisitCommand)
export class ImportVisitHandler
  extends BaseHandler<ImportVisitCommand, ApiResponseDto<ImportVisitResult>>
  implements
    ICommandHandler<ImportVisitCommand, ApiResponseDto<ImportVisitResult>>
{
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async handle(
    command: ImportVisitCommand,
  ): Promise<ApiResponseDto<ImportVisitResult>> {
    const { importVisitDto } = command;

    if (!importVisitDto.file) {
      throw new BadRequestHttpException('File is required');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(importVisitDto.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestHttpException(
        'Invalid Excel file: no worksheet found',
      );
    }

    const visitData = this.parseExcelFile(worksheet);

    const result: ImportVisitResult = {
      success: 0,
      failed: 0,
      errors: [],
      data: [],
    };

    // Process the visit import in a transaction
    await this.dataSource.transaction(async (manager) => {
      try {
        const createdVisit = await this.createVisit(visitData, manager);
        const visitDto = plainToInstance(VisitDto, createdVisit, {
          excludeExtraneousValues: true,
        });
        result.data.push(visitDto);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: 1,
          message: error.message || 'Unknown error during visit creation',
        });
      }
    });

    return CreatedResponse(result, 'Import completed');
  }

  private parseExcelFile(worksheet: ExcelJS.Worksheet): ExcelVisitData {
    const rows = worksheet.getSheetValues();

    if (!rows || rows.length < 8) {
      throw new BadRequestHttpException(
        'Excel file must contain visit information and participant data',
      );
    }

    // Parse visit information (first 5 rows)
    const companyName = this.getCellValue(rows[1], 2); // Nama Perusahaan
    const purpose = this.getCellValue(rows[2], 2); // Tujuan Kunjungan
    const startDate = this.getCellValue(rows[3], 2); // Tanggal Awal Kunjungan
    const endDate = this.getCellValue(rows[4], 2); // Tanggal Akhir Kunjungan
    const gates = this.getCellValue(rows[5], 2); // Gate

    if (!companyName || !purpose || !startDate || !endDate || !gates) {
      throw new BadRequestHttpException(
        'Missing required visit information (company, purpose, dates, gates)',
      );
    }

    // Parse participants (starting from row 8, skipping header at row 7)
    const participants = [];
    for (let i = 8; i < rows.length; i++) {
      const row = rows[i];
      if (!row || (Array.isArray(row) && row.length === 1 && !row[1])) {
        continue; // Skip empty rows
      }

      const name = this.getCellValue(row, 1); // Nama Peserta
      const email = this.getCellValue(row, 2)?.text; // Email
      const phone = this.getCellValue(row, 3); // Phone
      const idType = this.getCellValue(row, 4); // Type ID Card
      const idNumber = this.getCellValue(row, 5); // ID Card Number
      if (!name || !idType || !idNumber) {
        throw new BadRequestHttpException(
          `Missing participant information in row ${i - 6}`,
        );
      }

      participants.push({
        name: name.toString().trim(),
        email: email?.toString()?.trim() ?? null,
        phone: phone?.toString()?.trim() ?? null,
        idType: idType.toString().trim(),
        idNumber: idNumber.toString().trim(),
      });
    }

    if (participants.length === 0) {
      throw new BadRequestHttpException('No participants found in the file');
    }

    return {
      companyName: companyName.toString().trim(),
      purpose: purpose.toString().trim(),
      startDate: startDate.toString().trim(),
      endDate: endDate.toString().trim(),
      gates: gates.toString().trim(),
      participants,
    };
  }

  private getCellValue(row: any, index: number): any {
    if (!Array.isArray(row) || index >= row.length) {
      return null;
    }
    return row[index];
  }

  private async createVisit(
    visitData: ExcelVisitData,
    manager: EntityManager,
  ): Promise<Visit> {
    // Find or create company
    let company = await manager.findOne(Company, {
      where: { name: visitData.companyName },
    });

    if (!company) {
      company = manager.create(Company, {
        name: visitData.companyName,
        status: 1,
      });
      await manager.save(Company, company);
    }

    // Parse dates
    const visitDate = this.parseDate(visitData.startDate);
    const validUntil = this.parseDate(visitData.endDate);

    // Parse gates
    const gateIdentifiers = visitData.gates
      .split(',')
      .map((g) => parseInt(g.trim()))
      .filter((g) => !isNaN(g));

    const gates = await manager.find(Gate, {
      where: { gateIdentifier: In(gateIdentifiers) },
    });

    if (gates.length === 0) {
      throw new BadRequestHttpException(
        `No valid gates found for identifiers: ${gateIdentifiers.join(', ')}`,
      );
    }

    // Create participants (guests)
    const participants = [];
    for (const participantData of visitData.participants) {
      const guest = await this.createOrFindGuest(
        participantData,
        company.id,
        manager,
      );
      participants.push(guest);
    }

    // Create visit
    const visit = manager.create(Visit, {
      companyId: company.id,
      purpose: visitData.purpose,
      visitDate,
      validUntil,
    });

    const savedVisit = await manager.save(Visit, visit);

    // Create visit participants
    for (const guest of participants) {
      const visitParticipant = manager.create(VisitParticipant, {
        visitId: savedVisit.id,
        guestId: guest.id,
      });

      const visitGuest = await manager.save(VisitParticipant, visitParticipant);

      for (const gate of gates) {
        const visitParticipant = manager.create(VisitGuestGate, {
          visitGuestId: visitGuest.id,
          gateId: gate.id,
        });
        await manager.save(VisitGuestGate, visitParticipant);
      }
    }

    for (const gate of gates) {
      const visitParticipant = manager.create(VisitGate, {
        visitId: savedVisit.id,
        gateId: gate.id,
      });
      await manager.save(VisitGate, visitParticipant);
    }

    return savedVisit;
  }

  private async createOrFindGuest(
    participantData: ExcelVisitData['participants'][0],
    companyId: string,
    manager: EntityManager,
  ): Promise<AccountGuest> {
    // First, find existing guest by email
    let guest = await manager.findOne(AccountGuest, {
      where: { email: participantData.email },
    });

    if (guest) {
      return guest;
    }

    // Create new account for the guest
    const account = manager.create(Account, {
      accountType: AccountType.GUEST,
      status: 1, // Active by default
    });
    const savedAccount = await manager.save(Account, account);

    // Create new guest
    guest = manager.create(AccountGuest, {
      accountId: savedAccount.id,
      fullName: participantData.name,
      companyId,
      email: participantData.email,
      phone: participantData.phone,
      identificationType: getIdentificationTypes(participantData.idType),
      identificationNumber: participantData.idNumber,
    });
    await manager.save(AccountGuest, guest);

    return guest;
  }

  private parseDate(dateStr: string): Date {
    // Simple parsing - you might want to use a date library like moment.js
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    throw new BadRequestHttpException(`Invalid date format: ${dateStr}`);
  }
}
