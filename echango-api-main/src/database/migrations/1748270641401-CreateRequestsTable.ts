import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRequestsTable1748270641401 implements MigrationInterface {
  name = 'CreateRequestsTable1748270641401';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."request_status_enum" AS ENUM('REQUESTED', 'ON_HOLD', 'ACCEPTED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."request_status_enum" NOT NULL DEFAULT 'REQUESTED', "rejectReason" character varying(255), "additionalMessage" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "officeId" uuid, CONSTRAINT "PK_167d324701e6867f189aed52e18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" ADD "email" character varying(255)`,
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
      `ALTER TABLE "request" ADD CONSTRAINT "FK_8d896f637f935647f019c6a9000" FOREIGN KEY ("officeId") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "request" DROP CONSTRAINT "FK_8d896f637f935647f019c6a9000"`,
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
    await queryRunner.query(`ALTER TABLE "office" DROP COLUMN "email"`);
    await queryRunner.query(`DROP TABLE "request"`);
    await queryRunner.query(`DROP TYPE "public"."request_status_enum"`);
  }
}
