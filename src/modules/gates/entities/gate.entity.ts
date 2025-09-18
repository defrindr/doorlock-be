import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Location } from '@src/modules/locations/entities/location.entity';
import { GateType } from './gate-type.enum';

@Entity('gates')
export class Gate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'uuid', name: 'location_id', nullable: false })
  locationId: string;

  @Column({ type: 'tinyint', default: 1, nullable: false })
  status: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: GateType.PHYSICAL,
    nullable: false,
  })
  type: GateType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Location, (location) => location.id, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: Location;
}
