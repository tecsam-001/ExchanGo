import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOfficeTable1756977586886 implements MigrationInterface {
  name = 'UpdateOfficeTable1756977586886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "office" ADD "mainImageId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "office" ADD CONSTRAINT "UQ_80e8f88386ebd2143b19664915b" UNIQUE ("mainImageId")`,
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
      `ALTER TABLE "office" ADD CONSTRAINT "FK_80e8f88386ebd2143b19664915b" FOREIGN KEY ("mainImageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "office" DROP CONSTRAINT "FK_80e8f88386ebd2143b19664915b"`,
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
      `ALTER TABLE "office" DROP CONSTRAINT "UQ_80e8f88386ebd2143b19664915b"`,
    );
    await queryRunner.query(`ALTER TABLE "office" DROP COLUMN "mainImageId"`);
  }
}
