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
  OneToMany,
} from 'typeorm';
import { Account } from './account.entity';
import { Location } from '@src/modules/master/locations/entities/location.entity';

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

  @Column({ type: 'uuid', nullable: true, name: 'supervisor_id' })
  supervisorId: string;

  @Column({ type: 'uuid', nullable: true, name: 'location_id' })
  locationId: string;

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

  @OneToMany(() => AccountEmployee, (employee) => employee.supervisor)
  subordinates: AccountEmployee[];
}
