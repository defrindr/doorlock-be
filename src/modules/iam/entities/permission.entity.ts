import { BaseEntity } from '@src/shared/database/entities/abstract.entity';
import { Type } from 'class-transformer';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { RolePermission } from './role-permission.entity';
import { Role } from './role.entity';

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

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
