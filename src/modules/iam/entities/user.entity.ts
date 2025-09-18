import { BaseEntity } from '@src/shared/database/entities/abstract.entity';
import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './role.entity';

@Entity({
  name: 'users',
})
export class User extends BaseEntity {
  @Column({
    length: 50,
    unique: true,
  })
  public username: string;

  @Column({ length: 250 })
  @Exclude({ toPlainOnly: true })
  public password: string;

  @Column({ length: 50 })
  public name: string;

  @Column({
    length: 20,
    nullable: true,
    // unique: true,
  })
  public phone?: string;

  @Column({
    length: 255,
    nullable: true,
    // unique: true
  })
  public email?: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  public fcmToken?: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  public refreshToken?: string;

  @Column({ nullable: true })
  public photoUrl?: string;

  @Column({ type: 'varchar' })
  @IsNotEmpty()
  roleId: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status: 'active' | 'inactive';

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  public role?: Role;
}
