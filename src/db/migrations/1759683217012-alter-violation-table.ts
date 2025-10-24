import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterViolationTable1759683217011 implements MigrationInterface {
  name = 'AlterViolationTable1759683217011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -----------------------
    // VIOLATIONS
    // -----------------------
    await queryRunner.addColumn(
      'violations',
      new TableColumn({
        name: 'scannedAt',
        type: 'datetime2',
        isNullable: true, // or false, depending on your need
      }),
    );

    await queryRunner.addColumn(
      'account_employees',
      new TableColumn({
        name: 'end_date',
        type: 'date',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropColumn('account_employees', 'end_date');
    await queryRunner.dropColumn('violations', 'scannedAt');
  }
}
