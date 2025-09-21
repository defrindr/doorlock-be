import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnGateIdentifierTable1758182403104
  implements MigrationInterface
{
  name = 'AddColumnGateIdentifierTable1758182403104';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the new column
    await queryRunner.addColumn(
      'gates',
      new TableColumn({
        name: 'gate_identifier',
        type: 'int',
        isNullable: true, // or false, depending on your need
      }),
    );

    // Create index for the new column
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_gates_gate_identifier"
      ON "gates" ("gate_identifier")
      WHERE "gate_identifier" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('gates', 'UQ_gates_gate_identifier');
    await queryRunner.dropColumn('gate_identifier', 'gate_identifier');
  }
}
