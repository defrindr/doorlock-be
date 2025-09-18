import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToUsers1758140000000 implements MigrationInterface {
  name = 'AddStatusToUsers1758140000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" varchar(20) NOT NULL CONSTRAINT "DF_users_status_default" DEFAULT 'active'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
  }
}
