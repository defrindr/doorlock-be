import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Register Admin
    const AdminRole = await roleRepository.findOne({
      where: { name: 'Administrator' },
    });
    const UserRole = await roleRepository.findOne({ where: { name: 'User' } });

    const users = [
      {
        username: 'admin',
        password: await bcrypt.hash('password', 12),
        name: 'Admin User',
        email: 'admin@example.com',
        roleId: AdminRole?.id,
      },
      {
        username: 'user',
        password: await bcrypt.hash('password', 12),
        name: 'Regular User',
        email: 'user@example.com',
        roleId: UserRole?.id,
      },
    ];

    for (const user of users) {
      const userExist = await userRepository.findOne({
        where: { username: user.username },
      });

      if (!userExist) {
        const newUser = userRepository.create(user);
        await userRepository.save(newUser);
        console.log(`   - Created user: ${newUser.username}`);
      }
    }
  }
}
