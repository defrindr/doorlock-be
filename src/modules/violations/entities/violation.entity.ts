import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';

@Entity('violations')
export class Violation {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'employee_id', type: 'uniqueidentifier' })
  employeeId: string;

  @Column({ name: 'point_before', type: 'int' })
  pointBefore: number;

  @Column({ name: 'point_minus', type: 'int' })
  pointMinus: number;

  @Column({ name: 'point_after', type: 'int' })
  pointAfter: number;

  @Column({ name: 'violation_date', type: 'date' })
  violationDate: Date;

  @Column({
    name: 'violation_description',
    type: 'varchar',
    length: '255',
  })
  violationDescription: string;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'datetime2',
    default: () => 'getdate()',
  })
  createdAt: Date;

  @CreateDateColumn({
    name: 'scannedAt',
    type: 'datetime2',
    default: () => null,
  })
  scannedAt?: Date | null;

  // Relations
  @ManyToOne(() => AccountEmployee, { eager: false })
  @JoinColumn({ name: 'employee_id' })
  employee?: AccountEmployee;
}
