import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('affiche la navigation vers les trois pages', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const racine: HTMLElement = fixture.nativeElement;

    const liens = Array.from(racine.querySelectorAll('nav a')).map((a) => a.getAttribute('href'));
    expect(liens).toEqual(['/', '/inscription', '/inscrits']);
  });
});
