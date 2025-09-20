import { BadRequestException, Injectable } from '@nestjs/common';
import { VisitGate } from '@src/modules/visits/entities/visit-gate.entity';
import { VisitParticipant } from '@src/modules/visits/entities/visit-participant.entity';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class PrepareDataService {
  constructor(private readonly dataSource: DataSource) {}

  async prepare(payload: any) {
    let data = {};
    console.log('this is visitor');
    console.log(payload);
    if (payload.type == 'visitor') {
      data = await this.prepareVisitorData(payload.guestId, payload.visitId);
    }

    return JSON.stringify(data);
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

      const dbAccesses = await manager.find(VisitGate, {
        where: { visitId },
        relations: ['gate'],
      });

      const accesses = dbAccesses
        .map((vGate) => {
          return vGate.gate.id;
        })
        .join(',');

      return {
        id: visitAvailable.guest.account.id,
        nip: '-',
        nama: visitAvailable.guest.fullName,
        foto: visitAvailable.guest.account.photo,
        perusahaan: visitAvailable.visit.company?.name || '-',
        jabatan: '-',
        status_kartu: 'Tamu',
        poin: '-',
        aktif_mulai: visitAvailable.visit.visitDate,
        aktif_selesai: visitAvailable.visit.validUntil,
        access: accesses,
      };
    });
  }
}
