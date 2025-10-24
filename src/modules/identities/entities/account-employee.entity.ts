import { Company } from '@src/modules/master/companies/entities/company.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import { Location } from '@src/modules/master/locations/entities/location.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('account_employees')
export class AccountEmployee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'account_id', unique: true })
  accountId: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    name: 'employee_number',
  })
  employeeNumber: string;

  @Column({ type: 'nvarchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'int', name: 'violation_points' })
  violationPoints: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true, name: 'hire_date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({ type: 'uuid', nullable: true, name: 'supervisor_id' })
  supervisorId: string;

  @Column({ type: 'uuid', nullable: true, name: 'location_id' })
  locationId: string;

  @Column({ type: 'uuid', nullable: true, name: 'company_id' })
  companyId: string;

  @Column({ type: 'varchar', nullable: true, name: 'certification' })
  certification: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToOne(() => Account, (account) => account.employee)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => AccountEmployee, (employee) => employee.subordinates, {
    nullable: true,
  })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor: AccountEmployee;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => AccountEmployee, (employee) => employee.supervisor)
  subordinates: AccountEmployee[];

  @ManyToMany(() => Gate)
  @JoinTable({
    name: 'employee_gates',
    joinColumn: { name: 'employee_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'gate_id', referencedColumnName: 'id' },
  })
  accesses?: AccountEmployee[];
}
