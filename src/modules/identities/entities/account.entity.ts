import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { AccountType } from './account-type.enum';
import { AccountEmployee } from './account-employee.entity';
import { AccountIntern } from './account-intern.entity';
import { AccountGuest } from './account-guest.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
    name: 'nfc_code',
  })
  nfcCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'photo' })
  photo: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'more_details' })
  moreDetails: string;

  @Column({
    type: 'varchar',
    length: 50,
    enum: AccountType,
    name: 'account_type',
  })
  accountType: AccountType;

  @Column({ type: 'tinyint', default: 1, nullable: false })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToOne(() => AccountEmployee, (employee) => employee.account, {
    cascade: true,
    eager: false,
  })
  employee?: AccountEmployee;

  @OneToOne(() => AccountIntern, (intern) => intern.account, {
    cascade: true,
    eager: false,
  })
  intern?: AccountIntern;

  @OneToOne(() => AccountGuest, (guest) => guest.account, {
    cascade: true,
    eager: false,
  })
  guest?: AccountGuest;
}
