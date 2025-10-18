import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateViolationTable1759683217011 implements MigrationInterface {
  name = 'CreateViolationTable1759683217011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -----------------------
    // VIOLATIONS
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'violations',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'employee_id', type: 'uniqueidentifier' },
          { name: 'point_before', type: 'integer' },
          { name: 'point_minus', type: 'integer' },
          { name: 'point_after', type: 'integer' },
          { name: 'violation_date', type: 'date' },
          {
            name: 'violation_description',
            type: 'varchar',
            length: '255',
          },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('violations');
  }
}
