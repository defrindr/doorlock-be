import { BaseEntity } from '@src/shared/database/entities/abstract.entity';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { RolePermission } from './role-permission.entity';

export type IPermission = {
  id: string;
  name: string;
  description: string;
  rolePermissions?: RolePermission[];
};

@Entity('permissions')
export class Permission extends BaseEntity implements IPermission {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  @Type(() => String)
  name: string;

  @Column({
    type: 'text',
  })
  @Type(() => String)
  description: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];
}
