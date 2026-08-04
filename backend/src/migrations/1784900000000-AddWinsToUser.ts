import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWinsToUser1784900000000 implements MigrationInterface {
  name = 'AddWinsToUser1784900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "wins" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "wins"`);
  }
}
