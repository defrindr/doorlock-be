import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEmployee } from './account-employee.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';

@Entity('employee_gates')
export class EmployeeGate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'employee_id', unique: true })
  employeeId: string;

  @Column({ type: 'uuid', name: 'gate_id' })
  gateId: string;

  // Relations
  @ManyToOne(() => AccountEmployee, (employee) => employee.accesses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: AccountEmployee;

  @ManyToOne(() => Gate)
  @JoinColumn({ name: 'gate_id' })
  gate: Gate;
}
