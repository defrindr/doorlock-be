import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableColumnOptions,
} from 'typeorm';

export class Startup1703497491866 implements MigrationInterface {
  name = 'Startup1703497491866';

  private readonly baseColumns: TableColumnOptions[] = [
    {
      name: 'id',
      type: 'varchar',
      length: '36',
      isPrimary: true,
      default: 'NEWID()',
    },
    { name: 'created_at', type: 'datetime2', default: 'GETDATE()' },
    {
      name: 'updated_at',
      type: 'datetime2',
      default: 'GETDATE()',
      onUpdate: 'GETDATE()',
    },
    { name: 'deleted_at', type: 'datetime2', isNullable: true },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          ...this.baseColumns,
          { name: 'name', type: 'varchar', length: '50', isUnique: true },
          { name: 'description', type: 'varchar', isNullable: true },
        ],
      }),
      true, // true untuk createForeignKeys
    );

    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          ...this.baseColumns,
          { name: 'name', type: 'varchar', length: '50', isUnique: true },
          { name: 'description', type: 'varchar', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          ...this.baseColumns,
          { name: 'username', type: 'varchar', length: '50', isUnique: true },
          { name: 'password', type: 'varchar', length: '250' },
          { name: 'name', type: 'varchar', length: '50' },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'fcmToken', type: 'varchar', isNullable: true },
          { name: 'refreshToken', type: 'varchar', isNullable: true },
          { name: 'photoUrl', type: 'varchar', isNullable: true },
          { name: 'roleId', type: 'varchar', length: '36' }, // Tipe data harus sama dengan `roles.id`
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'roleId', type: 'varchar', length: '36' },
          { name: 'permissionId', type: 'varchar', length: '36' },
        ],
      }),
      true,
    );

    // =================================================================
    // 2. BUAT SEMUA FOREIGN KEY
    // =================================================================

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permissionId'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Urutan `down` adalah kebalikan dari `up`

    // =================================================================
    // 1. HAPUS SEMUA FOREIGN KEY
    // =================================================================
    const usersTable = await queryRunner.getTable('users');
    const rolePermissionsTable = await queryRunner.getTable('role_permissions');

    const userRoleFk = usersTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('roleId') !== -1,
    );
    if (userRoleFk) await queryRunner.dropForeignKey('users', userRoleFk);

    const rpRoleFk = rolePermissionsTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('roleId') !== -1,
    );
    if (rpRoleFk)
      await queryRunner.dropForeignKey('role_permissions', rpRoleFk);

    const rpPermissionFk = rolePermissionsTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('permissionId') !== -1,
    );
    if (rpPermissionFk)
      await queryRunner.dropForeignKey('role_permissions', rpPermissionFk);

    // =================================================================
    // 2. HAPUS SEMUA TABEL
    // =================================================================
    await queryRunner.dropTable('role_permissions');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('roles');
    await queryRunner.dropTable('permissions');
  }
}
