import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEmployeeAccessTableId1759683217007
  implements MigrationInterface
{
  name = 'CreateEmployeeAccessTableId1759683217007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -----------------------
    // EMPLOYEE_GATES
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'employee_gates',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'employee_id', type: 'uniqueidentifier' },
          { name: 'gate_id', type: 'uniqueidentifier' },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropForeignKey(
      'account_employees',
      'fk_account_employees_company_id',
    );
    await queryRunner.dropTable('employee_gates');
  }
}
