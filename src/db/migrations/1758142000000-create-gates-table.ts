import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGatesTable1758142000000 implements MigrationInterface {
  name = 'CreateGatesTable1758142000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gates" (
        "id" uniqueidentifier NOT NULL CONSTRAINT "DF_gates_id" DEFAULT NEWSEQUENTIALID(),
        "name" nvarchar(255) NOT NULL,
        "location_id" uniqueidentifier NOT NULL,
        "status" tinyint NOT NULL CONSTRAINT "DF_gates_status" DEFAULT 1,
        "type" varchar(20) NOT NULL CONSTRAINT "DF_gates_type" DEFAULT 'physical',
        "createdAt" datetime2 NOT NULL CONSTRAINT "DF_gates_createdAt" DEFAULT getdate(),
        "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_gates_updatedAt" DEFAULT getdate(),
        "deletedAt" datetime2,
        CONSTRAINT "PK_gates" PRIMARY KEY ("id")
      )`,
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "gates" ADD CONSTRAINT "FK_gates_location_id" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // Add check constraints
    await queryRunner.query(
      `ALTER TABLE "gates" ADD CONSTRAINT "CHK_gates_status" CHECK ("status" IN (0, 1))`,
    );

    await queryRunner.query(
      `ALTER TABLE "gates" ADD CONSTRAINT "CHK_gates_type" CHECK ("type" IN ('portable', 'physical'))`,
    );

    // Add unique constraint on name + location_id
    await queryRunner.query(
      `ALTER TABLE "gates" ADD CONSTRAINT "UQ_gates_name_location" UNIQUE ("name", "location_id")`,
    );

    // Add indices
    await queryRunner.query(
      `CREATE INDEX "IDX_gates_location_id" ON "gates" ("location_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_gates_type" ON "gates" ("type")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_gates_status" ON "gates" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_gates_deleted_at" ON "gates" ("deletedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "gates"`);
  }
}
