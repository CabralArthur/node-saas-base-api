import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActiveTeamIdToUsers1737940829626 implements MigrationInterface {
    name = 'AddActiveTeamIdToUsers1737940829626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "active_team_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "active_team_id"`);
    }

}
