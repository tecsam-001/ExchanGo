import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOfficeRateTable1746457554235 implements MigrationInterface {
  name = 'UpdateOfficeRateTable1746457554235';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_history" DROP CONSTRAINT "FK_3c6f4ea35a3bf330b25266a8d8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" DROP COLUMN "currencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" ADD "targetCurrencyId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" ADD "baseCurrencyId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" ADD CONSTRAINT "FK_2757893563e2af32d3336f1b353" FOREIGN KEY ("targetCurrencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" ADD CONSTRAINT "FK_35b91d340f1809d4355209fd90c" FOREIGN KEY ("baseCurrencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rate_history" DROP CONSTRAINT "FK_35b91d340f1809d4355209fd90c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" DROP CONSTRAINT "FK_2757893563e2af32d3336f1b353"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" DROP COLUMN "baseCurrencyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rate_history" DROP COLUMN "targetCurrencyId"`,
    );
    await queryRunner.query(`ALTER TABLE "rate_history" ADD "currencyId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "rate_history" ADD CONSTRAINT "FK_3c6f4ea35a3bf330b25266a8d8b" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
