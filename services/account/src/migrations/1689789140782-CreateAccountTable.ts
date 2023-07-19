import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountTable1689789140782 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS account (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL, 
        "email" varchar(100) NOT NULL, 
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "deleted_at" TIMESTAMP WITH TIME ZONE, 
        CONSTRAINT "PK_account" PRIMARY KEY ("id"))
    `);

    await queryRunner.query('CREATE INDEX idx_account_name ON account (name)');
    await queryRunner.query(
      'CREATE INDEX idx_account_email ON account (email)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX idx_account_name');
    await queryRunner.query('DROP INDEX idx_account_email');

    await queryRunner.query('DROP TABLE account');
  }
}
