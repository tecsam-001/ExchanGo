import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoreTables1745935226796 implements MigrationInterface {
  name = 'CreateMoreTables1745935226796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rate_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "old_buy_rate" numeric(10,2) NOT NULL, "old_sell_rate" numeric(10,2) NOT NULL, "new_buy_rate" numeric(10,2) NOT NULL, "new_sell_rate" numeric(10,2) NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "officeId" uuid, "currencyId" uuid, CONSTRAINT "PK_05969bc1ad5d6ac31b3d32f054c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "country" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "unicode" character varying(255) NOT NULL, "emoji" character varying(255) NOT NULL, "alpha2" character varying(255) NOT NULL, "dial_code" character varying(255) NOT NULL, "alpha3" character varying(255) NOT NULL, "region" character varying(255) NOT NULL, "capital" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "city" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "office_id" uuid, CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."alert_trigger_type_enum" AS ENUM('CITY', 'OFFICE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "alert" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trigger_type" "public"."alert_trigger_type_enum" NOT NULL, "whatsapp_number" character varying, "city" character varying array, "base_currency_amount" numeric NOT NULL, "target_currency_amount" numeric NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "office_id" uuid, "currency_id" uuid, "user_id" integer, "target_currency_id" uuid, CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" ADD CONSTRAINT "FK_f88d0e0db589188d82d1c216566" FOREIGN KEY ("officeId") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" ADD CONSTRAINT "FK_3c6f4ea35a3bf330b25266a8d8b" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "FK_9a88988f0c64cfcb2e16ea0a802" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" ADD CONSTRAINT "FK_df5bd00d792fd9a22a4fbc287bc" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" ADD CONSTRAINT "FK_360971dd8dd0e5620ed9cabe2d5" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" ADD CONSTRAINT "FK_d96af921be14b11c1ef4b8d4ca6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" ADD CONSTRAINT "FK_eda2a898ca10e0885183c468bd8" FOREIGN KEY ("target_currency_id") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alert" DROP CONSTRAINT "FK_eda2a898ca10e0885183c468bd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" DROP CONSTRAINT "FK_d96af921be14b11c1ef4b8d4ca6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" DROP CONSTRAINT "FK_360971dd8dd0e5620ed9cabe2d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" DROP CONSTRAINT "FK_df5bd00d792fd9a22a4fbc287bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "FK_9a88988f0c64cfcb2e16ea0a802"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" DROP CONSTRAINT "FK_3c6f4ea35a3bf330b25266a8d8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" DROP CONSTRAINT "FK_f88d0e0db589188d82d1c216566"`,
    );
    await queryRunner.query(`DROP TABLE "alert"`);
    await queryRunner.query(`DROP TYPE "public"."alert_trigger_type_enum"`);
    await queryRunner.query(`DROP TABLE "city"`);
    await queryRunner.query(`DROP TABLE "country"`);
    await queryRunner.query(`DROP TABLE "rate_history"`);
  }
}
