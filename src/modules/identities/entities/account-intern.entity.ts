import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Account } from './account.entity';
import { AccountEmployee } from './account-employee.entity';

@Entity('account_interns')
export class AccountIntern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'account_id', unique: true })
  accountId: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'intern_id' })
  internId: string;

  @Column({ type: 'nvarchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  university: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  major: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({ type: 'uuid', nullable: true, name: 'supervisor_id' })
  supervisorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToOne(() => Account, (account) => account.intern)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => AccountEmployee, (employee) => employee.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: AccountEmployee;
}
