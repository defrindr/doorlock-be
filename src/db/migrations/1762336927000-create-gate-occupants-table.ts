import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateGateOccupantsTable1762336927000
  implements MigrationInterface
{
  name = 'CreateGateOccupantsTable1762336927000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the gate_occupants table
    await queryRunner.createTable(
      new Table({
        name: 'gate_occupants',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          {
            name: 'account_id',
            type: 'uniqueidentifier',
          },
          {
            name: 'account_identifier',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'account_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'gate_identifier',
            type: 'integer',
          },
          {
            name: 'gate_id',
            type: 'uniqueidentifier',
          },
          {
            name: 'gate_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'card_uid',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'company_name',
            type: 'varchar',
            length: '250',
          },
          {
            name: 'entered_at',
            type: 'datetime2',
            default: 'getdate()',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'gate_occupants',
      new TableIndex({
        name: 'IDX_gate_occupants_account',
        columnNames: ['account_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'gate_occupants',
      new TableIndex({
        name: 'IDX_gate_occupants_gate',
        columnNames: ['gate_id'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'gate_occupants',
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'gate_occupants',
      new TableForeignKey({
        columnNames: ['gate_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'gates',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable('gate_occupants');
    if (table) {
      const accountForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('account_id') !== -1,
      );
      const gateForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('gate_id') !== -1,
      );

      if (accountForeignKey) {
        await queryRunner.dropForeignKey('gate_occupants', accountForeignKey);
      }
      if (gateForeignKey) {
        await queryRunner.dropForeignKey('gate_occupants', gateForeignKey);
      }

      // Drop indexes
      await queryRunner.dropIndex('gate_occupants', 'IDX_gate_occupants_gate');
      await queryRunner.dropIndex(
        'gate_occupants',
        'IDX_gate_occupants_account',
      );
    }

    // Drop table
    await queryRunner.dropTable('gate_occupants');
  }
}
