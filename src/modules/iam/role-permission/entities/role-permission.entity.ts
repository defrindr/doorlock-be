import { Permission } from '@src/modules/iam/permission/entities/permission.entity';
import { Role } from '@src/modules/iam/role/entities/role.entity';
import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

type IRolePermission = {
  id: number;
  roleId: number;
  permissionId: number;
  role: Role;
  permission: Permission;
};

@Entity('role_permissions')
export class RolePermission implements IRolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @IsNotEmpty()
  @PrimaryColumn()
  roleId: number;

  @Column({ type: 'int' })
  @IsNotEmpty()
  @PrimaryColumn()
  permissionId: number;

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  permission: Permission;
}
