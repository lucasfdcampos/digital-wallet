import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletTable1689790134564 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS wallet (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "account_id" uuid NOT NULL, 
        "account_number" varchar(7) NOT NULL, 
        "amount" decimal(10, 2) NOT NULL DEFAULT 0,
        "is_enabled" boolean NOT NULL DEFAULT TRUE, 
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "deleted_at" TIMESTAMP WITH TIME ZONE, 
        CONSTRAINT "PK_wallet" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wallet_account" FOREIGN KEY ("account_id") REFERENCES "account"("id"))
    `);

    await queryRunner.query(
      'CREATE INDEX idx_wallet_account_id ON wallet (account_id)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX idx_wallet_account_id');

    await queryRunner.query('DROP TABLE wallet');
  }
}
