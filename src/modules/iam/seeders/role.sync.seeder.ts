import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RoleDummies } from './role.dummy';
import { Role } from '../role/entities/role.entity';

export const roleSyncSeeder = async (
  entityManager: EntityManager,
): Promise<boolean> => {
  const data = RoleDummies;
  const destroyed = await entityManager.find(Role);
  const created: Role[] = [];

  data.forEach((newItem) => {
    const exist = destroyed.find((old) => {
      if (old?.id !== newItem?.id) return null;
      destroyed.splice(destroyed.indexOf(old), 1);
      return old;
    });

    let role = new Role();
    Object.assign(role, newItem);

    created.push(role);
  });

  await Promise.all([
    entityManager.save(created),
    entityManager.remove(destroyed),
  ]);

  Logger.log('roleSyncSeeder', 'AutomaticSeeder');

  return true;
};
