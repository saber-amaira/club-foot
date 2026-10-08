import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

function saisir(racine: HTMLElement, champ: string, valeur: string): void {
  const input = racine.querySelector<HTMLInputElement>(`input[formControlName="${champ}"]`)!;
  input.value = valeur;
  input.dispatchEvent(new Event('input'));
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it("affiche le formulaire d'inscription", () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;

    expect(racine.querySelector('h1')?.textContent).toContain('Inscription');
    expect(racine.querySelectorAll('input').length).toBe(5);
  });

  it("n'envoie rien tant que le formulaire est invalide", () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    http.expectNone('/api/inscriptions');
    expect((fixture.nativeElement as HTMLElement).querySelector('.message')).not.toBeNull();
  });

  it('envoie les données au backend quand le formulaire est valide', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;
    const http = TestBed.inject(HttpTestingController);

    saisir(racine, 'prenom', 'Léa');
    saisir(racine, 'nom', 'Martin');
    saisir(racine, 'dateNaissance', '2016-05-12');
    saisir(racine, 'emailParent', 'parent@example.com');
    saisir(racine, 'telephoneParent', '06 12 34 56 78');

    racine.querySelector('form')!.dispatchEvent(new Event('submit'));

    const requete = http.expectOne('/api/inscriptions');
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({
      prenom: 'Léa',
      nom: 'Martin',
      dateNaissance: '2016-05-12',
      emailParent: 'parent@example.com',
      telephoneParent: '06 12 34 56 78',
    });

    requete.flush({
      id: 1,
      prenom: 'Léa',
      nom: 'Martin',
      dateNaissance: '2016-05-12',
      createdAt: '2026-10-08T15:00:00Z',
    });
    fixture.detectChanges();

    expect(racine.querySelector('.succes')?.textContent).toContain('Léa Martin');
  });
});
