import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInscription1760000000000 implements MigrationInterface {
  name = 'CreateInscription1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "inscription" (
        "id" SERIAL NOT NULL,
        "prenom" character varying(100) NOT NULL,
        "nom" character varying(100) NOT NULL,
        "date_naissance" date NOT NULL,
        "categorie" character varying(10) NOT NULL,
        "email_parent" character varying(254) NOT NULL,
        "telephone_parent" character varying(20) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_inscription" PRIMARY KEY ("id"),
        CONSTRAINT "uk_inscription_enfant"
          UNIQUE ("prenom", "nom", "date_naissance", "email_parent")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "inscription"`);
  }
}
