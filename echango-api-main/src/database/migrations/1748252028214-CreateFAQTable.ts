import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFAQTable1748252028214 implements MigrationInterface {
  name = 'CreateFAQTable1748252028214';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "faq" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" character varying(500) NOT NULL, "answer" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "office_id" uuid, CONSTRAINT "PK_d6f5a52b1a96dd8d0591f9fbc47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46990f7bd5b518aecdde6c8b0c" ON "faq" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE TABLE "offices_images" ("office_id" uuid NOT NULL, "file_id" uuid NOT NULL, CONSTRAINT "PK_7ceea899d456374a740241d860a" PRIMARY KEY ("office_id", "file_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b861414e1fdc1510352dd3cd1" ON "offices_images" ("office_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_102e4e4651b5f2a0d8261de737" ON "offices_images" ("file_id") `,
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
      `ALTER TABLE "faq" ADD CONSTRAINT "FK_a27a819e1cf200423010fbf7bf3" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices_images" ADD CONSTRAINT "FK_8b861414e1fdc1510352dd3cd1d" FOREIGN KEY ("office_id") REFERENCES "office"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices_images" ADD CONSTRAINT "FK_102e4e4651b5f2a0d8261de7374" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offices_images" DROP CONSTRAINT "FK_102e4e4651b5f2a0d8261de7374"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offices_images" DROP CONSTRAINT "FK_8b861414e1fdc1510352dd3cd1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "faq" DROP CONSTRAINT "FK_a27a819e1cf200423010fbf7bf3"`,
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
      `DROP INDEX "public"."IDX_102e4e4651b5f2a0d8261de737"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8b861414e1fdc1510352dd3cd1"`,
    );
    await queryRunner.query(`DROP TABLE "offices_images"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_46990f7bd5b518aecdde6c8b0c"`,
    );
    await queryRunner.query(`DROP TABLE "faq"`);
  }
}
