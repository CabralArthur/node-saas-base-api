import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptionTables1737947495656 implements MigrationInterface {
    name = 'CreateSubscriptionTables1737947495656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plans" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "trial_days" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" SERIAL NOT NULL, "team_id" integer NOT NULL, "plan_id" integer NOT NULL, "paid_at" TIMESTAMP, "canceled_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL, "ends_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL, "status" character varying NOT NULL DEFAULT 'TRIAL', "stripe_subscription_id" character varying, "stripe_customer_id" character varying, "stripe_price_id" character varying, "user_id" integer NOT NULL, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7acbcb5935bee3137813103a58" ON "subscriptions" ("team_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e45fca5d912c3a2fab512ac25d" ON "subscriptions" ("plan_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6ccf973355b70645eff37774de" ON "subscriptions" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a2d09d943f39912a01831a927" ON "subscriptions" ("stripe_subscription_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7aa77f6636d26cac1b731cac3a" ON "subscriptions" ("stripe_customer_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d0a95ef8a28188364c546eb65c" ON "subscriptions" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "payments" ("id" SERIAL NOT NULL, "subscription_id" integer NOT NULL, "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL, "status" character varying NOT NULL, "payment_method" character varying NOT NULL, "stripe_payment_id" character varying, "invoice_link" character varying, "paid_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_75848dfef07fd19027e08ca81d" ON "payments" ("subscription_id") `);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7acbcb5935bee3137813103a58b" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_75848dfef07fd19027e08ca81d2" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_75848dfef07fd19027e08ca81d2"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7acbcb5935bee3137813103a58b"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e45fca5d912c3a2fab512ac25dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75848dfef07fd19027e08ca81d"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0a95ef8a28188364c546eb65c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7aa77f6636d26cac1b731cac3a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3a2d09d943f39912a01831a927"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6ccf973355b70645eff37774de"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e45fca5d912c3a2fab512ac25d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7acbcb5935bee3137813103a58"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TABLE "plans"`);
    }

}
