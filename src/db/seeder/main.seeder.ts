import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { runSeeder, Seeder } from 'typeorm-extension';
import dataSource from '../options';

import PermissionSeeder from '@src/modules/iam/seeders/permission.seeder';
import RoleSeeder from '@src/modules/iam/seeders/role.seeder';
import UserSeeder from '@src/modules/iam/seeders/user.seeder';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    fresh: false,
    name: null as string | null,
  };

  for (const arg of args) {
    if (arg === '--fresh') {
      options.fresh = true;
    }
    if (arg.startsWith('--name=')) {
      options.name = arg.split('=')[1];
    }
  }

  return options;
};

async function clearDatabase(ds: DataSource) {
  console.log('🗑️  Clearing old data (--fresh)...');

  // Urutan penghapusan sangat penting untuk menghormati foreign key constraints.
  // Kita menggunakan raw query DELETE untuk melewati masalah TRUNCATE dan restriksi kriteria kosong TypeORM.

  // 1. Hapus tabel join terlebih dahulu.
  await ds.query('DELETE FROM role_permissions');
  console.log('   - Cleared join table: role_permissions');

  // 2. Hapus tabel users yang mereferensikan roles.
  await ds.query('DELETE FROM users');
  console.log('   - Cleared table: users');

  // 3. Sekarang tabel parent/referensi bisa dihapus dengan aman.
  await ds.query('DELETE FROM roles');
  console.log('   - Cleared table: roles');

  await ds.query('DELETE FROM permissions');
  console.log('   - Cleared table: permissions');

  console.log('✅ Database cleared.');
}

async function bootstrap() {
  const options = parseArgs();

  const seederMap: { [key: string]: new () => Seeder } = {
    permission: PermissionSeeder,
    role: RoleSeeder,
    user: UserSeeder,
  };

  await dataSource.initialize();
  console.log('✔️ Data source initialized.');

  if (options.fresh) {
    await clearDatabase(dataSource);
  }

  if (options.name) {
    const SelectedSeeder = seederMap[options.name.toLowerCase()];
    if (SelectedSeeder) {
      console.log(`\n▶️  Running specific seeder: ${options.name}`);
      await runSeeder(dataSource, SelectedSeeder);
    } else {
      console.error(`❌ Seeder with name "${options.name}" not found.`);
      console.log('   Available seeders:', Object.keys(seederMap).join(', '));
    }
  } else {
    // Perilaku default: jalankan semua seeder secara berurutan
    console.log('\n▶️  Running all seeders in sequence...');
    await runSeeder(dataSource, PermissionSeeder);
    await runSeeder(dataSource, RoleSeeder);
    await runSeeder(dataSource, UserSeeder);
    console.log('✅ All seeders finished.');
  }

  await dataSource.destroy();
  console.log('✔️ Data source destroyed.');
}

bootstrap()
  .then(() => console.log('\n🌱 Seeding process completed successfully!'))
  .catch((err) => {
    console.error('❌ An error occurred during the seeding process:', err);
    process.exit(1);
  });
