import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Visit } from './visit.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';

@Entity('visit_participants')
export class VisitParticipant {
  [x: string]: any;
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'visit_id' })
  visitId: string;

  @Column({ type: 'uuid', name: 'guest_id' })
  guestId: string;

  @CreateDateColumn({
    type: 'datetime2',
    name: 'createdAt',
    default: () => 'getdate()',
  })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Visit, (visit) => visit.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @ManyToOne(() => AccountGuest)
  @JoinColumn({ name: 'guest_id' })
  guest: AccountGuest;

  @ManyToMany(() => Gate)
  @JoinTable({
    name: 'visit_guest_gates',
    joinColumn: { name: 'visit_guest_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'gate_id', referencedColumnName: 'id' },
  })
  accesses?: Gate[];
}
