import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompaniesTable1758179245205 implements MigrationInterface {
  name = 'CreateCompaniesTable1758179245205';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE [companies] (
            [id] uniqueidentifier NOT NULL CONSTRAINT "DF_companies_id" DEFAULT NEWSEQUENTIALID(),
            [name] varchar(250) NOT NULL,
            [address] nvarchar(MAX) NULL,
            [status] tinyint NOT NULL CONSTRAINT "DF_companies_status" DEFAULT 1,
            [createdAt] datetime2 NOT NULL CONSTRAINT "DF_companies_createdAt" DEFAULT getdate(),
            [updatedAt] datetime2 NOT NULL CONSTRAINT "DF_companies_updatedAt" DEFAULT getdate(),
            [deletedAt] datetime2,
            CONSTRAINT [PK_companies] PRIMARY KEY ([id])
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "CHK_companies_status" CHECK ("status" IN (0, 1))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE [companies]`);
  }
}
