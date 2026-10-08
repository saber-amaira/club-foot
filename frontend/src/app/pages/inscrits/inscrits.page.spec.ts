import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { InscritsPage } from './inscrits.page';

const LISTE = [
  {
    id: 3,
    prenom: 'Emma',
    nom: 'Petit',
    dateNaissance: '2016-03-02',
    categorie: 'U11',
    emailParent: 'emma.parent@example.com',
    telephoneParent: '0611223344',
    createdAt: '2026-10-08T10:00:00Z',
  },
  {
    id: 2,
    prenom: 'Hugo',
    nom: 'Durand',
    dateNaissance: '2018-07-21',
    categorie: 'U9',
    emailParent: 'hugo.parent@example.com',
    telephoneParent: '0655667788',
    createdAt: '2026-10-07T10:00:00Z',
  },
  {
    id: 1,
    prenom: 'Léa',
    nom: 'Martin',
    dateNaissance: '2016-05-12',
    categorie: 'U11',
    emailParent: 'lea.parent@example.com',
    telephoneParent: '0699887766',
    createdAt: '2026-10-06T10:00:00Z',
  },
];

function cartes(racine: HTMLElement): number {
  return racine.querySelectorAll('.carte-inscrit').length;
}

function deverrouiller(racine: HTMLElement, http: HttpTestingController): void {
  racine.querySelector<HTMLInputElement>('input[type="password"]')!.value = 'ma-cle';
  racine.querySelector('form')!.dispatchEvent(new Event('submit'));
  http.expectOne('/api/inscriptions').flush(LISTE);
}

describe('InscritsPage', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [InscritsPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('demande la clé du club tant que la session est vide', () => {
    const fixture = TestBed.createComponent(InscritsPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);

    expect(racine.querySelector('input[type="password"]')).not.toBeNull();
    expect(cartes(racine)).toBe(0);
    http.expectNone('/api/inscriptions');
  });

  it('envoie la clé saisie puis affiche la liste', () => {
    const fixture = TestBed.createComponent(InscritsPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);

    racine.querySelector<HTMLInputElement>('input[type="password"]')!.value = 'ma-cle';
    racine.querySelector('form')!.dispatchEvent(new Event('submit'));

    const requete = http.expectOne('/api/inscriptions');
    expect(requete.request.method).toBe('GET');
    expect(requete.request.headers.get('x-admin-key')).toBe('ma-cle');
    requete.flush(LISTE);
    fixture.detectChanges();

    expect(cartes(racine)).toBe(3);
    expect(racine.querySelector('input[type="password"]')).toBeNull();
  });

  it('refuse une mauvaise clé et reste verrouillée', () => {
    const fixture = TestBed.createComponent(InscritsPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);

    racine.querySelector<HTMLInputElement>('input[type="password"]')!.value = 'mauvaise';
    racine.querySelector('form')!.dispatchEvent(new Event('submit'));
    http
      .expectOne('/api/inscriptions')
      .flush({ message: 'Clé administrateur invalide' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(racine.querySelector('.alerte')?.textContent).toContain('Clé invalide');
    expect(racine.querySelector('input[type="password"]')).not.toBeNull();
    expect(sessionStorage.getItem('club-foot.cle-admin')).toBeNull();
  });

  it('recharge directement la liste quand la clé est déjà en session', () => {
    sessionStorage.setItem('club-foot.cle-admin', 'cle-existante');

    const fixture = TestBed.createComponent(InscritsPage);
    const http = TestBed.inject(HttpTestingController);

    const requete = http.expectOne('/api/inscriptions');
    expect(requete.request.headers.get('x-admin-key')).toBe('cle-existante');
    requete.flush(LISTE);
    fixture.detectChanges();

    expect(cartes(fixture.nativeElement)).toBe(3);
  });

  it('filtre par recherche et par catégorie', () => {
    const fixture = TestBed.createComponent(InscritsPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);

    deverrouiller(racine, http);
    fixture.detectChanges();

    const recherche = racine.querySelector<HTMLInputElement>('input[type="search"]')!;
    recherche.value = 'lea';
    recherche.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(cartes(racine)).toBe(1);
    expect(racine.querySelector('.nom')?.textContent).toContain('Léa');

    recherche.value = '';
    recherche.dispatchEvent(new Event('input'));
    const filtre = racine.querySelector<HTMLSelectElement>('select')!;
    filtre.value = 'U11';
    filtre.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(cartes(racine)).toBe(2);
  });

  it('se verrouille de nouveau sur demande', () => {
    const fixture = TestBed.createComponent(InscritsPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);

    deverrouiller(racine, http);
    fixture.detectChanges();

    const boutons = Array.from(racine.querySelectorAll<HTMLButtonElement>('.outils button'));
    boutons.find((b) => b.textContent?.includes('Verrouiller'))!.click();
    fixture.detectChanges();

    expect(racine.querySelector('input[type="password"]')).not.toBeNull();
    expect(sessionStorage.getItem('club-foot.cle-admin')).toBeNull();
  });
});
