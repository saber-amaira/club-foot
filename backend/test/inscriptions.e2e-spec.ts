import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/**
 * Test d'intégration : nécessite un PostgreSQL (docker compose up -d db en local,
 * service postgres dans la CI) joignable via DATABASE_URL.
 */
const ADMIN_KEY = 'cle-de-test';

/** Date de naissance donnant un âge d'environ `age` ans (âge ou âge-1 selon la date du jour). */
function naissance(age: number): string {
  return `${new Date().getFullYear() - age}-01-15`;
}

function inscription(surcharge: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    prenom: 'Léa',
    nom: 'Martin',
    dateNaissance: naissance(10),
    emailParent: 'Parent@Example.com',
    telephoneParent: '06 12 34 56 78',
    ...surcharge,
  };
}

describe('Inscriptions (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.ADMIN_KEY = ADMIN_KEY;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "inscription" RESTART IDENTITY');
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health répond ok quand la base est joignable', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('POST /api/inscriptions crée une inscription et calcule la catégorie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/inscriptions')
      .send(inscription())
      .expect(201);

    expect(res.body.id).toEqual(expect.any(Number));
    expect(res.body.prenom).toBe('Léa');
    expect(res.body.nom).toBe('Martin');
    expect(res.body.categorie).toBe('U11');
    // les coordonnées du parent ne sont jamais renvoyées au public
    expect(res.body.emailParent).toBeUndefined();
    expect(res.body.telephoneParent).toBeUndefined();
  });

  it('rejette les données invalides avec une erreur par champ', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/inscriptions')
      .send(inscription({ prenom: '', emailParent: 'pas-un-email' }))
      .expect(400);

    expect(res.body.erreurs.prenom).toBeDefined();
    expect(res.body.erreurs.emailParent).toBeDefined();
  });

  it('rejette un enfant trop jeune ou trop âgé', async () => {
    for (const age of [2, 30]) {
      const res = await request(app.getHttpServer())
        .post('/api/inscriptions')
        .send(inscription({ dateNaissance: naissance(age) }))
        .expect(400);
      expect(res.body.erreurs.dateNaissance).toBeDefined();
    }
  });

  it('rejette les champs inconnus', async () => {
    await request(app.getHttpServer())
      .post('/api/inscriptions')
      .send(inscription({ admin: true }))
      .expect(400);
  });

  it('refuse une inscription en double (409)', async () => {
    await request(app.getHttpServer()).post('/api/inscriptions').send(inscription()).expect(201);

    const res = await request(app.getHttpServer())
      .post('/api/inscriptions')
      .send(inscription())
      .expect(409);
    expect(res.body.message).toBe('Cette inscription existe déjà');
  });

  it('GET /api/inscriptions exige la clé administrateur', async () => {
    await request(app.getHttpServer()).get('/api/inscriptions').expect(401);
    await request(app.getHttpServer())
      .get('/api/inscriptions')
      .set('x-admin-key', 'mauvaise-cle')
      .expect(401);
  });

  it('GET /api/inscriptions liste les inscrits, du plus récent au plus ancien', async () => {
    await request(app.getHttpServer())
      .post('/api/inscriptions')
      .send(inscription({ prenom: 'Ancien' }))
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/inscriptions')
      .send(inscription({ prenom: 'Récent' }))
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/api/inscriptions')
      .set('x-admin-key', ADMIN_KEY)
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].prenom).toBe('Récent');
    expect(res.body[1].prenom).toBe('Ancien');
    expect(res.body[0].emailParent).toBe('parent@example.com');
    expect(res.body[0].categorie).toBe('U11');
  });
});
