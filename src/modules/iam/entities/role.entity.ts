import { User } from '@src/modules/iam/entities/user.entity';
import { BaseEntity } from '@src/shared/database/entities/abstract.entity';
import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  Unique,
} from 'typeorm';
import { Permission } from './permission.entity';
import { RolePermission } from './role-permission.entity';

export type IRole = {
  id?: string;
  name: string;
  rolePermission?: any[];
  users: User[];
};

@Entity('roles')
export class Role extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  @Unique('name', ['name'])
  @Type(() => String)
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @Type(() => String)
  description: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions?: RolePermission[];

  @ManyToMany(() => Permission, { cascade: true })
  @JoinTable({
    name: 'role_permissions', // Join table name
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users?: User[];
}
