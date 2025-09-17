import { BaseEntity } from '@src/shared/database/entities/abstract.entity';
import { User } from '@src/modules/iam/entities/user.entity';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { RolePermission } from './role-permission.entity';

export type IRole = {
  id?: number;
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

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions?: RolePermission[];

  @OneToMany(() => User, (user) => user.role)
  users?: User[];
}
