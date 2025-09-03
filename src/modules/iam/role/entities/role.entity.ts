import { BaseEntity } from '@src/shared/database/entities/abstract.entity';
import { RolePermission } from '@src/modules/iam/role-permission/entities/role-permission.entity';
import { User } from '@src/modules/iam/users/entities/user.entity';
import { Type } from 'class-transformer';
import { Column, Entity, OneToMany, Unique } from 'typeorm';

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
