import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { User } from '../users/entities/user.entity';
import * as argon2 from 'argon2';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Register Admin
    const AdminRole = await roleRepository.findOne({
      where: { name: 'Administrator' },
    });
    const UserRole = await roleRepository.findOne({ where: { name: 'User' } });

    const newUser = userRepository.create({
      username: 'admin',
      password: await argon2.hash('password'),
      name: 'Admin User',
      email: 'admin@example.com',
      roleId: AdminRole?.id,
    });
    await userRepository.save(newUser);
    console.log(`   - Created user: ${newUser.username}`);

    // Generate User
    const user = userRepository.create({
      username: 'user',
      password: await argon2.hash('password'),
      name: 'Regular User',
      email: 'user@example.com',
      roleId: UserRole?.id,
    });
    await userRepository.save(user);
    console.log(`   - Created user: ${user.username}`);
  }
}
