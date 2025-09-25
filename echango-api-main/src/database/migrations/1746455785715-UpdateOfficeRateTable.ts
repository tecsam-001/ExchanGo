import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOfficeRateTable1746455785715 implements MigrationInterface {
  name = 'UpdateOfficeRateTable1746455785715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "office_rate" DROP CONSTRAINT "FK_00a8dbf87ac0fc84b5b4d1ddb8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" DROP COLUMN "currencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" ADD "baseCurrencyId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" ADD "targetCurrencyId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" ADD CONSTRAINT "FK_b300555da6d44186dc77ef4a291" FOREIGN KEY ("baseCurrencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" ADD CONSTRAINT "FK_64b2574c9373ec2b79554b080b6" FOREIGN KEY ("targetCurrencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "office_rate" DROP CONSTRAINT "FK_64b2574c9373ec2b79554b080b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" DROP CONSTRAINT "FK_b300555da6d44186dc77ef4a291"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" DROP COLUMN "targetCurrencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office_rate" DROP COLUMN "baseCurrencyId"`,
    );
    await queryRunner.query(`ALTER TABLE "office_rate" ADD "currencyId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "office_rate" ADD CONSTRAINT "FK_00a8dbf87ac0fc84b5b4d1ddb8e" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
