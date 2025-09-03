import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Permission } from '../permission/entities/permission.entity';

export default class PermissionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const permissionRepository = dataSource.getRepository(Permission);

    // Daftar izin dasar
    const permissions = [
      {
        name: 'manage_users',
        description: 'Membuat, Melihat, Memperbarui, dan Menghapus Pengguna',
      },
      {
        name: 'manage_roles',
        description: 'Membuat, Melihat, Memperbarui, dan Menghapus Peran',
      },
      { name: 'view_dashboard', description: 'Melihat dasbor analitik' },
      // Tambahkan izin lain sesuai kebutuhan
    ];

    console.log('🌱 Seeding permissions...');
    for (const permData of permissions) {
      // Cek apakah izin sudah ada untuk menghindari duplikat
      const permissionExists = await permissionRepository.findOneBy({
        name: permData.name,
      });
      if (!permissionExists) {
        const newPermission = permissionRepository.create(permData);
        await permissionRepository.save(newPermission);
        console.log(`   - Created permission: ${permData.name}`);
      }
    }
  }
}
