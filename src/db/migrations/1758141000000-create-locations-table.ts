import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocationsTable1758141000000 implements MigrationInterface {
  name = 'CreateLocationsTable1758141000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "locations" (
        "id" uniqueidentifier NOT NULL CONSTRAINT "DF_locations_id" DEFAULT NEWSEQUENTIALID(),
        "name" nvarchar(255) NOT NULL,
        "type" varchar(20) NOT NULL,
        "status" tinyint NOT NULL CONSTRAINT "DF_locations_status" DEFAULT 1,
        "createdAt" datetime2 NOT NULL CONSTRAINT "DF_locations_createdAt" DEFAULT getdate(),
        "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_locations_updatedAt" DEFAULT getdate(),
        "deletedAt" datetime2,
        CONSTRAINT "PK_locations" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "locations" ADD CONSTRAINT "CHK_locations_type" CHECK ("type" IN ('warehouse', 'in_plant', 'crossdock'))`,
    );

    await queryRunner.query(
      `ALTER TABLE "locations" ADD CONSTRAINT "CHK_locations_status" CHECK ("status" IN (0, 1))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "locations"`);
  }
}
