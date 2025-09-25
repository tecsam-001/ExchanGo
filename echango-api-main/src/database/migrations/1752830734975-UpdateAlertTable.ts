import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAlertTable1752830734975 implements MigrationInterface {
  name = 'UpdateAlertTable1752830734975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alert" DROP CONSTRAINT "FK_df5bd00d792fd9a22a4fbc287bc"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alert_office" ("alert_id" uuid NOT NULL, "office_id" uuid NOT NULL, CONSTRAINT "PK_4c63ef3bb0ad20d50bd8c295acb" PRIMARY KEY ("alert_id", "office_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a7712bbc4bffa4ec8ac6758cb5" ON "alert_office" ("alert_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e0a65f1ba6d57347e13f32b88" ON "alert_office" ("office_id") `,
    );
    await queryRunner.query(`ALTER TABLE "alert" DROP COLUMN "office_id"`);
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
      `ALTER TABLE "alert" ALTER COLUMN "is_active" SET DEFAULT true`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_128fab2118030a7591f37ffa9a" ON "alert" ("createdAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_office" ADD CONSTRAINT "FK_a7712bbc4bffa4ec8ac6758cb59" FOREIGN KEY ("alert_id") REFERENCES "alert"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_office" ADD CONSTRAINT "FK_1e0a65f1ba6d57347e13f32b880" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alert_office" DROP CONSTRAINT "FK_1e0a65f1ba6d57347e13f32b880"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_office" DROP CONSTRAINT "FK_a7712bbc4bffa4ec8ac6758cb59"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_128fab2118030a7591f37ffa9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" ALTER COLUMN "is_active" SET DEFAULT false`,
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
    await queryRunner.query(`ALTER TABLE "alert" ADD "office_id" uuid`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e0a65f1ba6d57347e13f32b88"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a7712bbc4bffa4ec8ac6758cb5"`,
    );
    await queryRunner.query(`DROP TABLE "alert_office"`);
    await queryRunner.query(
      `ALTER TABLE "alert" ADD CONSTRAINT "FK_df5bd00d792fd9a22a4fbc287bc" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
