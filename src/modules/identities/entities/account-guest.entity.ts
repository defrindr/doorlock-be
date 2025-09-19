import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IdentificationType } from './account-type.enum';
import { Account } from './account.entity';
import { Company } from '@src/modules/master/companies/entities/company.entity';

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

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
  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
