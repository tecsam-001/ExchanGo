import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatingTables1746440574615 implements MigrationInterface {
  name = 'UpdatingTables1746440574615';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alert_city" ("alert_id" uuid NOT NULL, "city_id" uuid NOT NULL, CONSTRAINT "PK_7a6928c892dbdd2fb45a1faaeec" PRIMARY KEY ("alert_id", "city_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e86b77b72d1c03dcf14f8b8f3f" ON "alert_city" ("alert_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55baba0c14b6b2df2947281a47" ON "alert_city" ("city_id") `,
    );
    await queryRunner.query(`ALTER TABLE "alert" DROP COLUMN "city"`);
    await queryRunner.query(
      `ALTER TABLE "office" ADD "currency_exchange_license_number" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_city" ADD CONSTRAINT "FK_e86b77b72d1c03dcf14f8b8f3f5" FOREIGN KEY ("alert_id") REFERENCES "alert"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_city" ADD CONSTRAINT "FK_55baba0c14b6b2df2947281a47d" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alert_city" DROP CONSTRAINT "FK_55baba0c14b6b2df2947281a47d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_city" DROP CONSTRAINT "FK_e86b77b72d1c03dcf14f8b8f3f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" DROP COLUMN "currency_exchange_license_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert" ADD "city" character varying array`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55baba0c14b6b2df2947281a47"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e86b77b72d1c03dcf14f8b8f3f"`,
    );
    await queryRunner.query(`DROP TABLE "alert_city"`);
  }
}
