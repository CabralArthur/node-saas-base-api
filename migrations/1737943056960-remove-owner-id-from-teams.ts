import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOwnerIdFromTeams1737943056960 implements MigrationInterface {
    name = 'RemoveOwnerIdFromTeams1737943056960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "owner_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" ADD "owner_id" integer NOT NULL`);
    }

}
