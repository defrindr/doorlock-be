import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateVisitGuestGateTableTableId1759683217009
  implements MigrationInterface
{
  name = 'CreateVisitGuestGateTableTableId1759683217009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // -----------------------
    // VISIT_GUEST_GATES
    // -----------------------
    await queryRunner.createTable(
      new Table({
        name: 'visit_guest_gates',
        columns: [
          {
            name: 'id',
            type: 'uniqueidentifier',
            isPrimary: true,
            default: 'NEWSEQUENTIALID()',
          },
          { name: 'visit_guest_id', type: 'uniqueidentifier' },
          { name: 'gate_id', type: 'uniqueidentifier' },
          { name: 'createdAt', type: 'datetime2', default: 'getdate()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable('employee_gates');
  }
}
