import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdentityTable1758182403102 implements MigrationInterface {
  name = 'CreateIdentityTable1758182403102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create accounts table
    await queryRunner.query(
      `CREATE TABLE [accounts] (
        [id] uniqueidentifier NOT NULL CONSTRAINT [DF_accounts_id] DEFAULT NEWSEQUENTIALID(),
        [nfc_code] varchar(255) NULL,
        [account_type] varchar(50) NOT NULL,
        [photo] varchar(255) NULL,
        [more_details] nvarchar(MAX) NULL,
        [status] tinyint NOT NULL CONSTRAINT [DF_accounts_status] DEFAULT 1,
        [createdAt] datetime2 NOT NULL CONSTRAINT [DF_accounts_createdAt] DEFAULT getdate(),
        [updatedAt] datetime2 NOT NULL CONSTRAINT [DF_accounts_updatedAt] DEFAULT getdate(),
        [deletedAt] datetime2 NULL,
        CONSTRAINT [PK_accounts] PRIMARY KEY ([id])
      )`,
    );

    // Create account_employees table
    await queryRunner.query(
      `CREATE TABLE [account_employees] (
        [id] uniqueidentifier NOT NULL CONSTRAINT [DF_account_employees_id] DEFAULT NEWSEQUENTIALID(),
        [account_id] uniqueidentifier NOT NULL,
        [employee_id] varchar(50) NOT NULL,
        [full_name] nvarchar(255) NOT NULL,
        [department] nvarchar(100) NULL,
        [position] nvarchar(100) NULL,
        [email] varchar(255) NULL,
        [violation_points] int NOT NULL CONSTRAINT [DF_employees_violation_points] DEFAULT 10,
        [phone] varchar(50) NULL,
        [hire_date] date NULL,
        [supervisor_id] uniqueidentifier NULL,
        [createdAt] datetime2 NOT NULL CONSTRAINT [DF_account_employees_createdAt] DEFAULT getdate(),
        [updatedAt] datetime2 NOT NULL CONSTRAINT [DF_account_employees_updatedAt] DEFAULT getdate(),
        [deletedAt] datetime2 NULL,
        CONSTRAINT [PK_account_employees] PRIMARY KEY ([id])
      )`,
    );

    // Create account_interns table
    await queryRunner.query(
      `CREATE TABLE [account_interns] (
        [id] uniqueidentifier NOT NULL CONSTRAINT [DF_account_interns_id] DEFAULT NEWSEQUENTIALID(),
        [account_id] uniqueidentifier NOT NULL,
        [intern_id] varchar(50) NOT NULL,
        [full_name] nvarchar(255) NOT NULL,
        [university] nvarchar(255) NULL,
        [major] nvarchar(100) NULL,
        [semester] int NULL,
        [email] varchar(255) NULL,
        [phone] varchar(50) NULL,
        [start_date] date NULL,
        [end_date] date NULL,
        [supervisor_id] uniqueidentifier NULL,
        [createdAt] datetime2 NOT NULL CONSTRAINT [DF_account_interns_createdAt] DEFAULT getdate(),
        [updatedAt] datetime2 NOT NULL CONSTRAINT [DF_account_interns_updatedAt] DEFAULT getdate(),
        [deletedAt] datetime2 NULL,
        CONSTRAINT [PK_account_interns] PRIMARY KEY ([id])
      )`,
    );

    // Create account_guests table
    await queryRunner.query(
      `CREATE TABLE [account_guests] (
        [id] uniqueidentifier NOT NULL CONSTRAINT [DF_account_guests_id] DEFAULT NEWSEQUENTIALID(),
        [account_id] uniqueidentifier NOT NULL,
        [full_name] nvarchar(255) NOT NULL,
        [company] nvarchar(255) NULL,
        [purpose] nvarchar(500) NULL,
        [email] varchar(255) NULL,
        [phone] varchar(50) NULL,
        [visit_date] datetime2 NULL,
        [valid_until] datetime2 NULL,
        [host_employee_id] uniqueidentifier NULL,
        [identification_type] varchar(50) NULL,
        [identification_number] varchar(100) NULL,
        [createdAt] datetime2 NOT NULL CONSTRAINT [DF_account_guests_createdAt] DEFAULT getdate(),
        [updatedAt] datetime2 NOT NULL CONSTRAINT [DF_account_guests_updatedAt] DEFAULT getdate(),
        [deletedAt] datetime2 NULL,
        CONSTRAINT [PK_account_guests] PRIMARY KEY ([id])
      )`,
    );

    // Add foreign key constraints for account relationships first
    await queryRunner.query(
      `ALTER TABLE [account_employees] ADD CONSTRAINT [FK_account_employees_account_id] FOREIGN KEY ([account_id]) REFERENCES [accounts]([id]) ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_interns] ADD CONSTRAINT [FK_account_interns_account_id] FOREIGN KEY ([account_id]) REFERENCES [accounts]([id]) ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_guests] ADD CONSTRAINT [FK_account_guests_account_id] FOREIGN KEY ([account_id]) REFERENCES [accounts]([id]) ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // Add self-referencing foreign keys for supervisors (using NO ACTION to avoid conflicts)
    await queryRunner.query(
      `ALTER TABLE [account_employees] ADD CONSTRAINT [FK_account_employees_supervisor_id] FOREIGN KEY ([supervisor_id]) REFERENCES [account_employees]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_interns] ADD CONSTRAINT [FK_account_interns_supervisor_id] FOREIGN KEY ([supervisor_id]) REFERENCES [account_employees]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_guests] ADD CONSTRAINT [FK_account_guests_host_employee_id] FOREIGN KEY ([host_employee_id]) REFERENCES [account_employees]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Add check constraints
    await queryRunner.query(
      `ALTER TABLE [accounts] ADD CONSTRAINT [CHK_accounts_status] CHECK ([status] IN (0, 1))`,
    );

    await queryRunner.query(
      `ALTER TABLE [accounts] ADD CONSTRAINT [CHK_accounts_account_type] CHECK ([account_type] IN ('employee', 'intern', 'guest'))`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_guests] ADD CONSTRAINT [CHK_account_guests_identification_type] CHECK ([identification_type] IN ('ktp', 'passport', 'driver_license', 'other'))`,
    );

    // Add unique constraints
    await queryRunner.query(
      `ALTER TABLE [accounts] ADD CONSTRAINT [UQ_accounts_nfc_code] UNIQUE ([nfc_code])`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_employees] ADD CONSTRAINT [UQ_account_employees_employee_id] UNIQUE ([employee_id])`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_employees] ADD CONSTRAINT [UQ_account_employees_account_id] UNIQUE ([account_id])`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_interns] ADD CONSTRAINT [UQ_account_interns_intern_id] UNIQUE ([intern_id])`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_interns] ADD CONSTRAINT [UQ_account_interns_account_id] UNIQUE ([account_id])`,
    );

    await queryRunner.query(
      `ALTER TABLE [account_guests] ADD CONSTRAINT [UQ_account_guests_account_id] UNIQUE ([account_id])`,
    );

    // Add indices for performance
    await queryRunner.query(
      `CREATE INDEX [IDX_accounts_nfc_code] ON [accounts] ([nfc_code])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_accounts_account_type] ON [accounts] ([account_type])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_accounts_status] ON [accounts] ([status])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_accounts_deletedAt] ON [accounts] ([deletedAt])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_employees_employee_id] ON [account_employees] ([employee_id])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_employees_department] ON [account_employees] ([department])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_employees_deletedAt] ON [account_employees] ([deletedAt])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_interns_intern_id] ON [account_interns] ([intern_id])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_interns_university] ON [account_interns] ([university])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_interns_deletedAt] ON [account_interns] ([deletedAt])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_guests_visit_date] ON [account_guests] ([visit_date])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_guests_valid_until] ON [account_guests] ([valid_until])`,
    );

    await queryRunner.query(
      `CREATE INDEX [IDX_account_guests_deletedAt] ON [account_guests] ([deletedAt])`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE [account_guests]`);
    await queryRunner.query(`DROP TABLE [account_interns]`);
    await queryRunner.query(`DROP TABLE [account_employees]`);
    await queryRunner.query(`DROP TABLE [accounts]`);
  }
}
