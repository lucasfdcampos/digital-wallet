import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHistoryTable1689792447777 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS history (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "wallet_id" uuid NOT NULL,
        "old_amount" decimal(10, 2) NOT NULL,
        "new_amount" decimal(10, 2) NOT NULL,
        "type" varchar(30) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_history_wallet" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id"))
    `);

    await queryRunner.query(
      'CREATE INDEX idx_history_wallet_id ON history (wallet_id)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX idx_history_wallet_id');

    await queryRunner.query('DROP TABLE history');
  }
}
