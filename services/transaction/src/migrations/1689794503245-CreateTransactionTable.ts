import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionTable1689794503245 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS transaction (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "wallet_id" uuid NOT NULL,
        "value" decimal(10, 2) NOT NULL,
        "type" varchar(30) NOT NULL,
        "status" varchar(30) NOT NULL,
        "original_transaction_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_transaction" PRIMARY KEY ("id"))
    `);

    await queryRunner.query(
      'CREATE INDEX idx_transaction_wallet_id ON transaction (wallet_id)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX idx_transaction_wallet_id');

    await queryRunner.query('DROP TABLE transaction');
  }
}
