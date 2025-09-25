import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkHoursTable1747658205981 implements MigrationInterface {
  name = 'CreateWorkHoursTable1747658205981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "working_hour" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dayOfWeek" character varying(20) NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "fromTime" TIME DEFAULT '00:00', "toTime" TIME DEFAULT '00:00', "hasBreak" boolean NOT NULL DEFAULT false, "breakFromTime" TIME DEFAULT '00:00', "breakToTime" TIME, "officeId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_227995aef58f0f198f79ad42203" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "working_hour" ADD CONSTRAINT "FK_8489522875e99da56db4c5424a5" FOREIGN KEY ("officeId") REFERENCES "office"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "working_hour" DROP CONSTRAINT "FK_8489522875e99da56db4c5424a5"`,
    );
    await queryRunner.query(`DROP TABLE "working_hour"`);
  }
}
