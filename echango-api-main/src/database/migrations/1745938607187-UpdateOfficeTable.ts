import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOfficeTable1745938607187 implements MigrationInterface {
  name = 'UpdateOfficeTable1745938607187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "office" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "office" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "city" ADD "country_id" uuid`);
    await queryRunner.query(`ALTER TABLE "office" ADD "city_id" uuid`);
    await queryRunner.query(`ALTER TABLE "office" ADD "country_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "country" ADD CONSTRAINT "UQ_05bb99dff5ece9e1234a48bf0da" UNIQUE ("alpha2")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05bb99dff5ece9e1234a48bf0d" ON "country" ("alpha2") `,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "FK_08af2eeb576770524fa05e26f39" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" ADD CONSTRAINT "FK_b3d06e4a69cbb491e07ee1e6cf6" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" ADD CONSTRAINT "FK_424d489c170582601fe1153312b" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "office" DROP CONSTRAINT "FK_424d489c170582601fe1153312b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" DROP CONSTRAINT "FK_b3d06e4a69cbb491e07ee1e6cf6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "FK_08af2eeb576770524fa05e26f39"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05bb99dff5ece9e1234a48bf0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "country" DROP CONSTRAINT "UQ_05bb99dff5ece9e1234a48bf0da"`,
    );
    await queryRunner.query(`ALTER TABLE "office" DROP COLUMN "country_id"`);
    await queryRunner.query(`ALTER TABLE "office" DROP COLUMN "city_id"`);
    await queryRunner.query(`ALTER TABLE "city" DROP COLUMN "country_id"`);
    await queryRunner.query(
      `ALTER TABLE "office" ADD "country" character varying(255) NOT NULL DEFAULT 'Morocco'`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" ADD "city" character varying(255)`,
    );
  }
}
