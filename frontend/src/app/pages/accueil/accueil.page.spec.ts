import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AccueilPage } from './accueil.page';

describe('AccueilPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccueilPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("présente le club et mène vers l'inscription", () => {
    const fixture = TestBed.createComponent(AccueilPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;

    expect(racine.querySelector('h1')?.textContent).toContain('Rejoins');
    expect(racine.querySelector('a[href="/inscription"]')).not.toBeNull();
  });

  it('liste les six catégories', () => {
    const fixture = TestBed.createComponent(AccueilPage);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;

    const codes = Array.from(racine.querySelectorAll('.categories strong')).map((e) =>
      e.textContent?.trim(),
    );
    expect(codes).toEqual(['U7', 'U9', 'U11', 'U13', 'U15', 'U17']);
  });
});
