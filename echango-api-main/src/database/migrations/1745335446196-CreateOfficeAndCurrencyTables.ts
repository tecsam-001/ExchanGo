import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOfficeAndCurrencyTables1745335446196
  implements MigrationInterface
{
  name = 'CreateOfficeAndCurrencyTables1745335446196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "office" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "office_name" character varying(255) NOT NULL, "registration_number" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(255), "state" character varying(255), "country" character varying(255) NOT NULL DEFAULT 'Morocco', "location" geometry(Point,4326), "primary_phone_number" character varying(255) NOT NULL, "secondary_phone_number" character varying(255), "third_phone_number" character varying(255), "whatsapp_number" character varying(255), "slug" character varying(255), "is_active" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "is_featured" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "ownerId" integer, "logoId" uuid, CONSTRAINT "REL_1d01f1fc1cf7473ba705c94980" UNIQUE ("logoId"), CONSTRAINT "PK_200185316ba169fda17e3b6ba00" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3c8567e9ecdce00e4fda70814b" ON "office" ("registration_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e4571ac3bfe7b20665e7cd75a" ON "office" USING GiST ("location") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_17421a99e541676f48a5b49698" ON "office" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_668b0391bdfa437463a94dff62" ON "office" ("is_active") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_277ce286e050d41af67d0dc66c" ON "office" ("is_verified") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5dd2e89998c443fc917e777077" ON "office" ("is_featured") `,
    );
    await queryRunner.query(
      `CREATE TABLE "currency" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "name_plural" character varying NOT NULL, "symbol" character varying NOT NULL, "symbol_native" character varying NOT NULL, "decimal_digits" smallint NOT NULL, "rounding" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_723472e41cae44beb0763f4039c" UNIQUE ("code"), CONSTRAINT "PK_3cda65c731a6264f0e444cc9b91" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" ADD CONSTRAINT "FK_3a83a8241e6db16dce9cfcc66f0" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" ADD CONSTRAINT "FK_1d01f1fc1cf7473ba705c94980e" FOREIGN KEY ("logoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "office" DROP CONSTRAINT "FK_1d01f1fc1cf7473ba705c94980e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "office" DROP CONSTRAINT "FK_3a83a8241e6db16dce9cfcc66f0"`,
    );
    await queryRunner.query(`DROP TABLE "currency"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5dd2e89998c443fc917e777077"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_277ce286e050d41af67d0dc66c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_668b0391bdfa437463a94dff62"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_17421a99e541676f48a5b49698"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e4571ac3bfe7b20665e7cd75a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c8567e9ecdce00e4fda70814b"`,
    );
    await queryRunner.query(`DROP TABLE "office"`);
  }
}
