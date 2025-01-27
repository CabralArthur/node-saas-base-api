import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDefaultDomainFromTeams1737942771803 implements MigrationInterface {
    name = 'RemoveDefaultDomainFromTeams1737942771803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "default_domain"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teams" ADD "default_domain" character varying NOT NULL`);
    }

}
