import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Visit } from './visit.entity';

@Entity('visit_gates')
export class VisitGate {
  [x: string]: any;
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'visit_id' })
  visitId: string;

  @Column({ type: 'uuid', name: 'gate_id' })
  gateId: string;

  @CreateDateColumn({
    type: 'datetime2',
    name: 'createdAt',
    default: () => 'getdate()',
  })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Visit, (visit) => visit.accesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @ManyToOne(() => Gate)
  @JoinColumn({ name: 'gate_id' })
  gate: Gate;
}
