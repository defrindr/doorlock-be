import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { EmployeeGate } from '@src/modules/identities/entities/employee-gates.entity';
import { VisitGuestGate } from '@src/modules/visits/entities/visit-guest-gate.entity';
import { VisitParticipant } from '@src/modules/visits/entities/visit-participant.entity';
import { DateHelper } from '@src/shared/utils/date-helper';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class PrepareDataService {
  constructor(private readonly dataSource: DataSource) {}

  async prepare(payload: any) {
    let data = {};
    if (payload.type == 'visitor') {
      data = await this.prepareVisitorData(payload.guestId, payload.visitId);
    } else if (payload.type == 'employee') {
      data = await this.prepareEmployeeData(payload.employeeId);
    }

    return data;
  }

  async prepareEmployeeData(employeeId: string) {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const employee = await manager.findOne(AccountEmployee, {
        where: {
          id: employeeId,
        },
        relations: ['account', 'company'],
      });

      if (!employee) {
        throw new BadRequestException('Employee not valid');
      }

      const dbAccesses = await manager.find(EmployeeGate, {
        where: { employeeId },
        relations: ['gate'],
      });

      const accesses = dbAccesses
        .map((vGate) => {
          return vGate.gate.gateIdentifier;
        })
        .join(',');

      return {
        id: employee.account.id,
        nip: employee.employeeNumber,
        nama: employee.fullName,
        foto: employee.account.photo,
        perusahaan: employee.company?.name || '-',
        jabatan: employee.position || '-',
        status_kartu: 'Employee',
        poin: employee.violationPoints,
        aktif_mulai: null,
        aktif_selesai: null,
        access: accesses,
      };
    });
  }

  async prepareVisitorData(guestId: string, visitId: string) {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const visitAvailable = await manager.findOne(VisitParticipant, {
        where: {
          guestId,
          visitId,
        },
        relations: ['guest', 'guest.account', 'visit', 'visit.company'],
      });

      if (!visitAvailable) {
        throw new BadRequestException('Data visit not valid');
      }

      const dbAccesses = await manager.find(VisitGuestGate, {
        where: { visitGuestId: visitAvailable.id },
        relations: ['gate'],
      });

      const accesses = dbAccesses
        .map((vGate) => {
          return vGate.gate.gateIdentifier;
        })
        .join(',');

      return {
        id: visitAvailable.guest.account.id,
        nip: visitAvailable.guest.identificationNumber,
        nama: visitAvailable.guest.fullName,
        foto: visitAvailable.guest.account.photo,
        perusahaan: visitAvailable.visit.company?.name || '-',
        jabatan: '-',
        status_kartu: 'Tamu',
        poin: '-',
        aktif_mulai: DateHelper.formatMachineDateTime(
          visitAvailable.visit.visitDate,
        ),
        aktif_selesai: DateHelper.formatMachineDateTime(
          visitAvailable.visit.validUntil,
        ),
        access: accesses,
      };
    });
  }
}
