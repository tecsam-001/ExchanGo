import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOfficeRatesTable1745338201822 implements MigrationInterface {
  name = 'CreateOfficeRatesTable1745338201822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "office_rate" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "buy_rate" numeric(10,2) NOT NULL, "sell_rate" numeric(10,2) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "officeId" uuid, "currencyId" uuid, CONSTRAINT "PK_1a49a43ffda13065c59e90535d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" ADD CONSTRAINT "FK_184fcc135973cd3213a55a8db8a" FOREIGN KEY ("officeId") REFERENCES "office"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" ADD CONSTRAINT "FK_00a8dbf87ac0fc84b5b4d1ddb8e" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "office_rate" DROP CONSTRAINT "FK_00a8dbf87ac0fc84b5b4d1ddb8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" DROP CONSTRAINT "FK_184fcc135973cd3213a55a8db8a"`,
    );
    await queryRunner.query(`DROP TABLE "office_rate"`);
  }
}
