import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Permission } from '../entities/permission.entity';

export default class PermissionSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const permissionRepository = dataSource.getRepository(Permission);

    // Daftar izin dasar
    const permissions = [
      {
        name: 'users:manage',
        description: 'Membuat, Melihat, Memperbarui, dan Menghapus Pengguna',
      },
      {
        name: 'roles:manage',
        description: 'Membuat, Melihat, Memperbarui, dan Menghapus Peran',
      },
      { name: 'dashboard:view', description: 'Melihat dasbor analitik' },
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
