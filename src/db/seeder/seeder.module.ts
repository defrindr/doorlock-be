import { Logger } from '@nestjs/common';
import dataSource from '../options';
import { EntityManager } from 'typeorm';
import { userSyncSeeder } from '@src/modules/iam/seeders/user.sync.seeder';
import { roleSyncSeeder } from '@src/modules/iam/seeders/role.sync.seeder';

export class SeederModule {
  static async forRoot() {
    await dataSource
      .initialize()
      .then(async () => {
        Logger.log('Success connect automatic seeder', 'AutomaticSeeder');
      })
      .catch((error) => Logger.error(error));

    const entityManager = new EntityManager(dataSource);
    await roleSyncSeeder(entityManager);
    await userSyncSeeder(entityManager);

    return { module: SeederModule };
  }
}
