import { Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { EntityManager } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserDummies } from './user.dummy';

export const userSyncSeeder = async (
  entityManager: EntityManager,
): Promise<boolean> => {
  const data = UserDummies;
  const destroyed = await entityManager.find(User);
  const created: User[] = [];

  for (let i = 0; i < data.length; i++) {
    const exist = destroyed.find((old) => {
      if (old?.id !== data[i]?.id) return null;
      destroyed.splice(destroyed.indexOf(old), 1);
      return old;
    });

    let user = new User();
    Object.assign(user, data[i]);
    user.password = await argon2.hash(user.password);
    created.push(user);
  }

  await Promise.all([
    entityManager.save(created),
    entityManager.remove(destroyed),
  ]);

  Logger.log('userSyncSeeder', 'AutomaticSeeder');

  return true;
};
