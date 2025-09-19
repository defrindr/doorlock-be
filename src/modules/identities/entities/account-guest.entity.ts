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
import { IdentificationType } from './account-type.enum';

@Entity('account_guests')
export class AccountGuest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'account_id', unique: true })
  accountId: string;

  @Column({ type: 'nvarchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'uuid', name: 'company_id', unique: true })
  companyId: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  purpose: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true, name: 'visit_date' })
  visitDate: Date;

  @Column({ type: 'date', nullable: true, name: 'valid_until' })
  validUntil: Date;

  @Column({ type: 'uuid', nullable: true, name: 'host_employee_id' })
  hostEmployeeId: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'identification_type',
  })
  identificationType: IdentificationType;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'identification_number',
  })
  identificationNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToOne(() => Account, (account) => account.guest)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => AccountEmployee, (employee) => employee.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'host_employee_id' })
  hostEmployee: AccountEmployee;
}
