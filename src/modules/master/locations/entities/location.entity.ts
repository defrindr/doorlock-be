import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { LocationType } from './location-type.enum';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: LocationType,
    nullable: false,
  })
  type: LocationType;

  @Column({ type: 'tinyint', default: 1, nullable: false })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
