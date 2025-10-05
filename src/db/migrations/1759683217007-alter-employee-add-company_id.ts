import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterEmployeeAddCompanyId1759683217007
  implements MigrationInterface
{
  name = 'AlterEmployeeAddCompanyId1759683217007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the new column
    await queryRunner.addColumn(
      'account_employees',
      new TableColumn({
        name: 'company_id',
        type: 'uniqueidentifier',
        isNullable: true, // or false, depending on your need
      }),
    );
    await queryRunner.addColumn(
      'account_employees',
      new TableColumn({
        name: 'certification',
        type: 'nvarchar',
        length: 'max',
        isNullable: true,
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKeys('account_employees', [
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        name: 'fk_account_employees_company_id',
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropForeignKey(
      'account_employees',
      'fk_account_employees_company_id',
    );
    await queryRunner.dropColumn('account_employees', 'certification');
    await queryRunner.dropColumn('account_employees', 'company_id');
  }
}
