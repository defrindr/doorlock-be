import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

type IRolePermission = {
  id: number;
  roleId: string;
  permissionId: string;
  role: Role;
  permission: Permission;
};

@Entity('role_permissions')
export class RolePermission implements IRolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  @IsNotEmpty()
  @PrimaryColumn()
  roleId: string;

  @Column({ type: 'varchar' })
  @IsNotEmpty()
  @PrimaryColumn()
  permissionId: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  permission: Permission;
}
