import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangingTransactionDate1725341660734
  implements MigrationInterface
{
  name = 'ChangingTransactionDate1725341660734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "transaction_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "transaction_date" date NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "transaction_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "transaction_date" TIMESTAMP NOT NULL`,
    );
  }
}
