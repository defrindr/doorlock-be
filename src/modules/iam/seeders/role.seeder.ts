import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
export default class RoleSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const roleRepository = dataSource.getRepository(Role);
    const permissionRepository = dataSource.getRepository(Permission);

    // 1. Ambil semua permissions yang ada
    const allPermissions = await permissionRepository.find();
    const dashboardPermission = await permissionRepository.findOneBy({
      name: 'dashboard:view',
    });

    // 2. Definisikan peran dan izinnya
    const rolesData = [
      {
        name: 'Administrator',
        description: '-',
        permissions: allPermissions, // Admin mendapatkan semua izin
      },
      {
        name: 'User',
        description: '-',
        permissions: dashboardPermission ? [dashboardPermission] : [], // User hanya bisa melihat dasbor
      },
    ];

    console.log('🌱 Seeding roles...');
    for (const roleData of rolesData) {
      // Cek apakah peran sudah ada
      const roleExists = await roleRepository.findOneBy({
        name: roleData.name,
      });
      if (!roleExists) {
        const newRole = await roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        });
        await roleRepository.save(newRole);
        console.log(`   - Created role: ${roleData.name}`);
      }
    }
  }
}
