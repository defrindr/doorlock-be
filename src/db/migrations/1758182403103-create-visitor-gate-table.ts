import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateVisitorGateTable1758182403103 implements MigrationInterface {
  name = 'CreateVisitorGateTable1758182403103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -----------------------
    // VISIT_GATES
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'visit_gates',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'visit_id', type: 'uniqueidentifier' },
          { name: 'gate_id', type: 'uniqueidentifier' },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
        ],
      }),
    );

    // -----------------------
    // FOREIGN KEYS
    // -----------------------
    await queryRunner.createForeignKeys('visit_gates', [
      new TableForeignKey({
        columnNames: ['visit_id'],
        referencedTableName: 'visits',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['gate_id'],
        referencedTableName: 'gates',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('visit_gates');
  }
}
