import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InscriptionPage } from './inscription.page';

/** Date de naissance donnant un âge d'environ 10 ans (catégorie U11 dans tous les cas). */
const NAISSANCE = `${new Date().getFullYear() - 10}-01-15`;

function saisir(racine: HTMLElement, id: string, valeur: string): void {
  const input = racine.querySelector<HTMLInputElement>(`#${id}`)!;
  input.value = valeur;
  input.dispatchEvent(new Event('input'));
}

function remplirFormulaire(racine: HTMLElement): void {
  saisir(racine, 'prenom', 'Léa');
  saisir(racine, 'nom', 'Martin');
  saisir(racine, 'dateNaissance', NAISSANCE);
  saisir(racine, 'emailParent', 'parent@example.com');
  saisir(racine, 'telephoneParent', '06 12 34 56 78');
}

describe('InscriptionPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it("affiche le formulaire d'inscription", () => {
    const fixture = TestBed.createComponent(InscriptionPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;

    expect(racine.querySelector('h1')?.textContent).toContain('Inscris');
    expect(racine.querySelectorAll('input').length).toBe(5);
  });

  it("n'envoie rien tant que le formulaire est invalide", () => {
    const fixture = TestBed.createComponent(InscriptionPage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    http.expectNone('/api/inscriptions');
    expect((fixture.nativeElement as HTMLElement).querySelector('.message')).not.toBeNull();
  });

  it('annonce la catégorie estimée dès que la date de naissance est saisie', () => {
    const fixture = TestBed.createComponent(InscriptionPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;

    saisir(racine, 'dateNaissance', NAISSANCE);
    fixture.detectChanges();

    expect(racine.querySelector('.apercu')?.textContent).toContain('U11');
  });

  it('envoie les données au backend puis confirme', () => {
    const fixture = TestBed.createComponent(InscriptionPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);

    remplirFormulaire(racine);
    racine.querySelector('form')!.dispatchEvent(new Event('submit'));

    const requete = http.expectOne('/api/inscriptions');
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({
      prenom: 'Léa',
      nom: 'Martin',
      dateNaissance: NAISSANCE,
      emailParent: 'parent@example.com',
      telephoneParent: '06 12 34 56 78',
    });

    requete.flush({
      id: 1,
      prenom: 'Léa',
      nom: 'Martin',
      dateNaissance: NAISSANCE,
      categorie: 'U11',
      createdAt: '2026-10-08T15:00:00Z',
    });
    fixture.detectChanges();

    const confirmation = racine.querySelector('.confirmation')?.textContent ?? '';
    expect(confirmation).toContain('Léa');
    expect(confirmation).toContain('U11');
  });

  it("affiche l'erreur renvoyée par le serveur sous le champ concerné", () => {
    const fixture = TestBed.createComponent(InscriptionPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);

    remplirFormulaire(racine);
    racine.querySelector('form')!.dispatchEvent(new Event('submit'));

    http
      .expectOne('/api/inscriptions')
      .flush(
        { message: 'Données invalides', erreurs: { dateNaissance: "L'enfant doit avoir entre 5 et 16 ans" } },
        { status: 400, statusText: 'Bad Request' },
      );
    fixture.detectChanges();

    expect(racine.querySelector('.message')?.textContent).toContain('entre 5 et 16 ans');
    expect(racine.querySelector('.alerte')).not.toBeNull();
  });
});
