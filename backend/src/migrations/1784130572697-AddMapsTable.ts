import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMapsTable1784130572697 implements MigrationInterface {
    name = 'AddMapsTable1784130572697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "maps" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "tiles" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "creatorId" uuid, CONSTRAINT "PK_dddaabaf432b881f9f6e13bf9bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "maps" ADD CONSTRAINT "FK_49b1499a0e1daafa0efa5e4dad4" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maps" DROP CONSTRAINT "FK_49b1499a0e1daafa0efa5e4dad4"`);
        await queryRunner.query(`DROP TABLE "maps"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
