import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccountIdColumn1758182403106 implements MigrationInterface {
  name = 'AlterAccountIdColumn1758182403106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the histories table
    const table = await queryRunner.getTable('histories');
    if (table) {
      const fk = table.foreignKeys.find(
        (f: any) => f.columnNames.indexOf('account_id') !== -1,
      );
      if (fk) {
        await queryRunner.dropForeignKey('histories', fk);
      }
    }

    await queryRunner.query(`
      ALTER TABLE histories
      ALTER COLUMN account_id uniqueidentifier NULL;
      ALTER TABLE histories
      ADD CONSTRAINT FK_histories_account_id FOREIGN KEY (account_id)
      REFERENCES accounts(id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Drop the modified FK first
      ALTER TABLE histories DROP CONSTRAINT FK_histories_account_id;

      -- Change column back to NOT NULL
      ALTER TABLE histories
      ALTER COLUMN account_id uniqueidentifier NOT NULL;

      -- Re-add the FK
      ALTER TABLE histories
      ADD CONSTRAINT FK_histories_account_id FOREIGN KEY (account_id)
      REFERENCES accounts(id);
      `);
  }
}
