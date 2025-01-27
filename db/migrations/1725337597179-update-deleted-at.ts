import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDeletedAt1725337597179 implements MigrationInterface {
  name = 'UpdateDeletedAt1725337597179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME COLUMN "is_deleted" TO "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "is_deleted" TO "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" RENAME COLUMN "is_deleted" TO "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "deleted_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "wallets" ADD "deleted_at" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD "deleted_at" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "deleted_at" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "deleted_at" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" RENAME COLUMN "deleted_at" TO "is_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "deleted_at" TO "is_deleted"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME COLUMN "deleted_at" TO "is_deleted"`,
    );
  }
}
