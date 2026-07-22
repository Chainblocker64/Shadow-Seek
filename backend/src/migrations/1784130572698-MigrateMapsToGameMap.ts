import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateMapsToGameMap1784130572698 implements MigrationInterface {
  name = 'MigrateMapsToGameMap1784130572698';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "maps"`);

    await queryRunner.query(`
      CREATE TABLE "maps" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "width" integer NOT NULL,
        "height" integer NOT NULL,
        "baseTile" character varying NOT NULL,
        "baseOverrides" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "objects" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "creatorId" uuid,
        CONSTRAINT "PK_dddaabaf432b881f9f6e13bf9bd" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "maps"`);

    await queryRunner.query(`
      CREATE TABLE "maps" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "width" integer NOT NULL,
        "height" integer NOT NULL,
        "tiles" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "creatorId" uuid,
        CONSTRAINT "PK_dddaabaf432b881f9f6e13bf9bd" PRIMARY KEY ("id")
      )
    `);
  }
}
