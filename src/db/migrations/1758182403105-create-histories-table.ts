import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
} from 'typeorm';

export class CreateHistoriesTable1758182403105 implements MigrationInterface {
  name = 'CreateHistoriesTable1758182403105';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the histories table
    await queryRunner.createTable(
      new Table({
        name: 'histories',
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
            name: 'company_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'card_uid',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          { name: 'status', type: 'varchar', length: '10' },
          { name: 'message', type: 'nvarchar', length: 'MAX' },
          {
            name: 'more_details',
            type: 'nvarchar',
            length: 'MAX',
            isNullable: true,
          },
          { name: 'timestamp', type: 'datetime2' },
          { name: 'sync_at', type: 'datetime2', default: 'getdate()' },
        ],
        checks: [
          new TableCheck({
            name: 'CHK_histories_status',
            expression: `[status] IN ('success', 'denied')`,
          }),
        ],
        indices: [
          { name: 'IDX_histories_status', columnNames: ['status'] },
          { name: 'IDX_histories_account_name', columnNames: ['account_name'] },
          { name: 'IDX_histories_gate_name', columnNames: ['gate_name'] },
          { name: 'IDX_histories_company_name', columnNames: ['company_name'] },
          { name: 'IDX_histories_timestamp', columnNames: ['timestamp'] },
        ],
      }),
    );

    await queryRunner.createForeignKeys('histories', [
      new TableForeignKey({
        columnNames: ['account_id'],
        referencedTableName: 'accounts',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['gate_id'],
        referencedTableName: 'gates',
        referencedColumnNames: ['id'],
        onDelete: 'NO ACTION',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('histories');
  }
}
