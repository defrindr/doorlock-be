import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
} from 'typeorm';

export class CreateIdentityTable1758182403102 implements MigrationInterface {
  name = 'CreateIdentityTable1758182403102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -----------------------
    // ACCOUNTS
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'accounts',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          {
            name: 'nfc_code',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'account_type', type: 'varchar', length: '50' },
          { name: 'photo', type: 'varchar', length: '255', isNullable: true },
          { name: 'more_details', type: 'nvarchar', isNullable: true },
          {
            name: 'status',
            type: 'tinyint',
            default: 1,
          },
          {
            name: 'createdAt',
            type: 'datetime2',
            default: 'getdate()',
          },
          {
            name: 'updatedAt',
            type: 'datetime2',
            default: 'getdate()',
          },
          { name: 'deletedAt', type: 'datetime2', isNullable: true },
        ],
        checks: [
          new TableCheck({
            name: 'CHK_accounts_status',
            expression: '[status] IN (0,1)',
          }),
          new TableCheck({
            name: 'CHK_accounts_account_type',
            expression: "[account_type] IN ('employee','intern','guest')",
          }),
        ],
        indices: [
          { name: 'IDX_accounts_nfc_code', columnNames: ['nfc_code'] },
          { name: 'IDX_accounts_account_type', columnNames: ['account_type'] },
          { name: 'IDX_accounts_status', columnNames: ['status'] },
          { name: 'IDX_accounts_deletedAt', columnNames: ['deletedAt'] },
        ],
      }),
    );

    // -----------------------
    // ACCOUNT_EMPLOYEES
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'account_employees',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'account_id', type: 'uniqueidentifier' },
          { name: 'employee_number', type: 'varchar', length: '50' },
          { name: 'full_name', type: 'nvarchar', length: '255' },
          {
            name: 'department',
            type: 'nvarchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'position',
            type: 'nvarchar',
            length: '100',
            isNullable: true,
          },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          {
            name: 'violation_points',
            type: 'int',
            default: 10,
          },
          { name: 'phone', type: 'varchar', length: '50', isNullable: true },
          { name: 'hire_date', type: 'date', isNullable: true },
          { name: 'supervisor_id', type: 'uniqueidentifier', isNullable: true },
          { name: 'location_id', type: 'uniqueidentifier', isNullable: true },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
          { name: 'updatedAt', type: 'datetime2', default: 'getdate()' },
          { name: 'deletedAt', type: 'datetime2', isNullable: true },
        ],
        uniques: [
          { columnNames: ['employee_number'] },
          { columnNames: ['account_id'] },
        ],
        indices: [
          {
            name: 'IDX_account_employees_employee_number',
            columnNames: ['employee_number'],
          },
          {
            name: 'IDX_account_employees_position',
            columnNames: ['position'],
          },
          {
            name: 'IDX_account_employees_department',
            columnNames: ['department'],
          },
          {
            name: 'IDX_account_employees_deletedAt',
            columnNames: ['deletedAt'],
          },
        ],
      }),
    );

    // -----------------------
    // ACCOUNT_INTERNS
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'account_interns',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'account_id', type: 'uniqueidentifier' },
          { name: 'intern_id', type: 'varchar', length: '50' },
          { name: 'full_name', type: 'nvarchar', length: '255' },
          {
            name: 'university',
            type: 'nvarchar',
            length: '255',
            isNullable: true,
          },
          { name: 'major', type: 'nvarchar', length: '100', isNullable: true },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'phone', type: 'varchar', length: '50', isNullable: true },
          { name: 'start_date', type: 'date', isNullable: true },
          { name: 'end_date', type: 'date', isNullable: true },
          { name: 'supervisor_id', type: 'uniqueidentifier', isNullable: true },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
          { name: 'updatedAt', type: 'datetime2', default: 'getdate()' },
          { name: 'deletedAt', type: 'datetime2', isNullable: true },
        ],
        uniques: [
          { columnNames: ['intern_id'] },
          { columnNames: ['account_id'] },
        ],
        indices: [
          { name: 'IDX_account_interns_intern_id', columnNames: ['intern_id'] },
          {
            name: 'IDX_account_interns_university',
            columnNames: ['university'],
          },
          { name: 'IDX_account_interns_deletedAt', columnNames: ['deletedAt'] },
        ],
      }),
    );

    // -----------------------
    // ACCOUNT_GUESTS
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'account_guests',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'account_id', type: 'uniqueidentifier' },
          { name: 'full_name', type: 'nvarchar', length: '255' },
          { name: 'company_id', type: 'uniqueidentifier' },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          { name: 'phone', type: 'varchar', length: '50', isNullable: true },
          {
            name: 'identification_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'identification_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
          { name: 'updatedAt', type: 'datetime2', default: 'getdate()' },
          { name: 'deletedAt', type: 'datetime2', isNullable: true },
        ],
        uniques: [{ columnNames: ['account_id'] }],
        checks: [
          new TableCheck({
            name: 'CHK_account_guests_identification_type',
            expression:
              "[identification_type] IN ('ktp','passport','driver_license','other')",
          }),
        ],
        indices: [
          {
            name: 'IDX_account_guests_identificationType',
            columnNames: ['identification_type'],
          },
          {
            name: 'IDX_account_guests_identificationNumber',
            columnNames: ['identification_number'],
          },
          { name: 'IDX_account_guests_deletedAt', columnNames: ['deletedAt'] },
        ],
      }),
    );

    // -----------------------
    // VISITS
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'visits',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'company_id', type: 'uniqueidentifier' },
          {
            name: 'purpose',
            type: 'nvarchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'host_employee_id',
            type: 'uniqueidentifier',
            isNullable: true,
          },
          { name: 'visit_date', type: 'datetime2', default: 'getdate()' },
          { name: 'valid_until', type: 'datetime2' },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
          { name: 'updatedAt', type: 'datetime2', default: 'getdate()' },
          { name: 'deletedAt', type: 'datetime2', isNullable: true },
        ],
        indices: [{ name: 'IDX_visits_deletedAt', columnNames: ['deletedAt'] }],
      }),
    );

    // -----------------------
    // VISIT_PARTICIPANTS
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'visit_participants',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'visit_id', type: 'uniqueidentifier' },
          { name: 'guest_id', type: 'uniqueidentifier' },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
        ],
      }),
    );

    // -----------------------
    // FOREIGN KEYS
    // -----------------------
    await queryRunner.createForeignKeys('account_employees', [
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['supervisor_id'],
        referencedTableName: 'account_employees',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['location_id'],
        referencedTableName: 'locations',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);

    await queryRunner.createForeignKeys('account_interns', [
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['supervisor_id'],
        referencedTableName: 'account_employees',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);

    await queryRunner.createForeignKeys('account_guests', [
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);

    await queryRunner.createForeignKeys('visits', [
      new TableForeignKey({
        columnNames: ['host_employee_id'],
        referencedTableName: 'account_employees',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
      }),
    ]);

    await queryRunner.createForeignKeys('visit_participants', [
      new TableForeignKey({
        columnNames: ['visit_id'],
        referencedTableName: 'visits',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['guest_id'],
        referencedTableName: 'account_guests',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    // Add filtered unique index manually
    await queryRunner.query(`
      CREATE UNIQUE INDEX UQ_account_nfc_code
      ON accounts(nfc_code)
      WHERE nfc_code IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX UQ_account_nfc_code ON accounts
    `);
    await queryRunner.dropTable('visit_participants');
    await queryRunner.dropTable('visits');
    await queryRunner.dropTable('account_guests');
    await queryRunner.dropTable('account_interns');
    await queryRunner.dropTable('account_employees');
    await queryRunner.dropTable('accounts');
  }
}
