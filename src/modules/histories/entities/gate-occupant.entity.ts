import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Account } from '@src/modules/identities/entities/account.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';

@Entity('gate_occupants')
@Index(['accountId'], { unique: true }) // One account can only be in one gate at a time
@Index(['gateId']) // For quick lookup by gate
export class GateOccupant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', name: 'account_id' })
  accountId: string;

  @Column({ type: 'varchar', length: 255, name: 'account_identifier' })
  accountIdentifier: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'account_name',
  })
  accountName?: string;

  @Column({ type: 'int', name: 'gate_identifier' })
  gateIdentifier: number;

  @Column({ type: 'uniqueidentifier', name: 'gate_id' })
  gateId: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'gate_name' })
  gateName?: string;

  @Column({ type: 'varchar', length: 50, name: 'card_uid' })
  cardUid: string;

  @Column({ type: 'varchar', length: 250, name: 'company_name' })
  companyName: string;

  @CreateDateColumn({
    type: 'datetime2',
    name: 'entered_at',
    default: () => 'getdate()',
  })
  enteredAt: Date;

  @ManyToOne(() => Account, { eager: false })
  @JoinColumn({ name: 'account_id' })
  account?: Account;

  @ManyToOne(() => Gate, { eager: false })
  @JoinColumn({ name: 'gate_id' })
  gate?: Gate;
}
