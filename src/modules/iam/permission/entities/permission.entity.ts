import { BaseEntity } from '@src/shared/entities/abstract.entity';
import { RolePermission } from '@src/modules/iam/role-permission/entities/role-permission.entity';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

export type IPermission = {
  id: string;
  name: string;
  description: string;
  RolePermissions?: RolePermission[];
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
