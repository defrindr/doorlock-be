import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VisitParticipant } from './visit-participant.entity';

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  purpose: string;

  @Column({ type: 'uuid', name: 'company_id', nullable: true })
  companyId: string;

  @Column({ type: 'uuid', name: 'host_employee_id', nullable: true })
  hostEmployeeId: string;

  @Column({ type: 'datetime2', name: 'visit_date', default: () => 'getdate()' })
  visitDate: Date;

  @Column({ type: 'datetime2', name: 'valid_until' })
  validUntil: Date;

  @CreateDateColumn({
    type: 'datetime2',
    name: 'createdAt',
    default: () => 'getdate()',
  })
  createdAt: Date;

  // Relations
  @ManyToOne(() => AccountEmployee, { nullable: true })
  @JoinColumn({ name: 'host_employee_id' })
  hostEmployee?: AccountEmployee;

  @OneToMany(() => VisitParticipant, (vp) => vp.visit)
  visitParticipants?: VisitParticipant[];

  @ManyToMany(() => AccountGuest)
  @JoinTable({
    name: 'visit_participants',
    joinColumn: { name: 'visitId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'guestId', referencedColumnName: 'id' },
  })
  participants?: AccountGuest[];

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;
}
