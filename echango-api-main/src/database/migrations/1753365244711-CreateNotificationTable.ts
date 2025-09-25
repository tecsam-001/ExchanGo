import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationTable1753365244711
  implements MigrationInterface
{
  name = 'CreateNotificationTable1753365244711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification_preference" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rate_update_reminder_whatsapp" boolean NOT NULL DEFAULT true, "rate_update_reminder_email" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "REL_ff040d2d2e35c49b0052578382" UNIQUE ("user_id"), CONSTRAINT "PK_ba8d816b10f3dcfcd2e71ce5776" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "notification_preference" ADD CONSTRAINT "FK_ff040d2d2e35c49b00525783829" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_preference" DROP CONSTRAINT "FK_ff040d2d2e35c49b00525783829"`,
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
    await queryRunner.query(`DROP TABLE "notification_preference"`);
  }
}
