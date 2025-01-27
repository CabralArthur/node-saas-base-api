import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTeamsAndMembers1737940489576 implements MigrationInterface {
    name = 'CreateTeamsAndMembers1737940489576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "teams" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "default_domain" character varying NOT NULL, "owner_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "members" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "team_id" integer NOT NULL, "role" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_recover_passwords" ("id" SERIAL NOT NULL, "used" boolean NOT NULL DEFAULT false, "token" character varying NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9a2b49434750e9a32d109a5a55c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_da404b5fd9c390e25338996e2d1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "members" ADD CONSTRAINT "FK_eee0b30f2ccac9355b8c28f7391" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_recover_passwords" ADD CONSTRAINT "FK_983c0e58eb07eb88702323d9329" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_recover_passwords" DROP CONSTRAINT "FK_983c0e58eb07eb88702323d9329"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_eee0b30f2ccac9355b8c28f7391"`);
        await queryRunner.query(`ALTER TABLE "members" DROP CONSTRAINT "FK_da404b5fd9c390e25338996e2d1"`);
        await queryRunner.query(`DROP TABLE "user_recover_passwords"`);
        await queryRunner.query(`DROP TABLE "members"`);
        await queryRunner.query(`DROP TABLE "teams"`);
    }

}
