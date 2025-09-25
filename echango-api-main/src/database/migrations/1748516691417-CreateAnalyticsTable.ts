import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsTable1748516691417 implements MigrationInterface {
  name = 'CreateAnalyticsTable1748516691417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profile_view" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ip_address" inet, "user_agent" character varying(500), "referrer" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "office_id" uuid, "viewer_id" integer, CONSTRAINT "PK_a333641775d7d72e678b84046a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55d8d445cea01be923516855fd" ON "profile_view" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ba9cdf387bf0e7bdda5b5eca7" ON "profile_view" ("office_id", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."phone_call_phone_type_enum" AS ENUM('PRIMARY', 'SECONDARY', 'THIRD', 'WHATSAPP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "phone_call" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone_number" character varying(20) NOT NULL, "phone_type" "public"."phone_call_phone_type_enum" NOT NULL, "ip_address" inet, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "office_id" uuid, "caller_id" integer, CONSTRAINT "PK_f7a9579283280d3571d6ba5a79a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7084e606257b68b20b9d7b24af" ON "phone_call" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9660e3102e7383737a9c3fc3b4" ON "phone_call" ("office_id", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "gps_click" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ip_address" inet, "user_agent" character varying(500), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "office_id" uuid, "user_id" integer, CONSTRAINT "PK_7b668d4a8b9be3f530e122aa969" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fac645d465baf4022e81199212" ON "gps_click" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8c24b5bec74431406e68b4e81" ON "gps_click" ("office_id", "createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "working_hour" ALTER COLUMN "fromTime" SET DEFAULT '00:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_hour" ALTER COLUMN "toTime" SET DEFAULT '00:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_hour" ALTER COLUMN "breakFromTime" SET DEFAULT '00:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_view" ADD CONSTRAINT "FK_eae1f4fcf256f2b0e91e50d50d1" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_view" ADD CONSTRAINT "FK_5ef19fd4e518bf905a56062c770" FOREIGN KEY ("viewer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_call" ADD CONSTRAINT "FK_1c755d400a0fedb1b68e33d7144" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_call" ADD CONSTRAINT "FK_6569fe4d77e2e4230c7d5fc4b33" FOREIGN KEY ("caller_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gps_click" ADD CONSTRAINT "FK_3bf3bd37a34ffb69542e60399c7" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gps_click" ADD CONSTRAINT "FK_37a80034fde2c39df17c01ae374" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gps_click" DROP CONSTRAINT "FK_37a80034fde2c39df17c01ae374"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gps_click" DROP CONSTRAINT "FK_3bf3bd37a34ffb69542e60399c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_call" DROP CONSTRAINT "FK_6569fe4d77e2e4230c7d5fc4b33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_call" DROP CONSTRAINT "FK_1c755d400a0fedb1b68e33d7144"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_view" DROP CONSTRAINT "FK_5ef19fd4e518bf905a56062c770"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profile_view" DROP CONSTRAINT "FK_eae1f4fcf256f2b0e91e50d50d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_hour" ALTER COLUMN "breakFromTime" SET DEFAULT '00:00:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_hour" ALTER COLUMN "toTime" SET DEFAULT '00:00:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_hour" ALTER COLUMN "fromTime" SET DEFAULT '00:00:00'`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8c24b5bec74431406e68b4e81"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fac645d465baf4022e81199212"`,
    );
    await queryRunner.query(`DROP TABLE "gps_click"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9660e3102e7383737a9c3fc3b4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7084e606257b68b20b9d7b24af"`,
    );
    await queryRunner.query(`DROP TABLE "phone_call"`);
    await queryRunner.query(`DROP TYPE "public"."phone_call_phone_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6ba9cdf387bf0e7bdda5b5eca7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55d8d445cea01be923516855fd"`,
    );
    await queryRunner.query(`DROP TABLE "profile_view"`);
  }
}
