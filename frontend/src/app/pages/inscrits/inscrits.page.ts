import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AdminSession } from '../../core/admin-session';
import { InscriptionService } from '../../core/inscription.service';
import { CATEGORIES, InscriptionComplete, calculerAge } from '../../core/models';

function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

@Component({
  selector: 'app-inscrits-page',
  imports: [DatePipe],
  templateUrl: './inscrits.page.html',
  styleUrl: './inscrits.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscritsPage {
  private readonly service = inject(InscriptionService);
  protected readonly session = inject(AdminSession);

  protected readonly categories = CATEGORIES;

  protected readonly inscrits = signal<InscriptionComplete[]>([]);
  protected readonly chargement = signal(false);
  protected readonly erreur = signal<string | null>(null);
  protected readonly recherche = signal('');
  protected readonly filtreCategorie = signal('');

  protected readonly visibles = computed(() => {
    const terme = normaliser(this.recherche());
    const categorie = this.filtreCategorie();
    return this.inscrits().filter(
      (i) =>
        (!categorie || i.categorie === categorie) &&
        (!terme || normaliser(`${i.prenom} ${i.nom} ${i.emailParent}`).includes(terme)),
    );
  });

  constructor() {
    // Clé déjà saisie dans cet onglet : on recharge directement la liste
    if (this.session.cle()) {
      this.charger();
    }
  }

  protected connecter(evenement: Event, valeur: string): void {
    evenement.preventDefault();
    const cle = valeur.trim();
    if (!cle) {
      this.erreur.set('Saisis la clé du club.');
      return;
    }
    this.charger(cle);
  }

  protected charger(cle: string | null = this.session.cle()): void {
    if (!cle) {
      return;
    }
    this.chargement.set(true);
    this.erreur.set(null);
    this.service.lister(cle).subscribe({
      next: (liste) => {
        this.session.definir(cle);
        this.inscrits.set(liste);
        this.chargement.set(false);
      },
      error: (erreur: HttpErrorResponse) => {
        this.chargement.set(false);
        if (erreur.status === 401) {
          this.session.effacer();
          this.inscrits.set([]);
          this.erreur.set('Clé invalide.');
        } else {
          this.erreur.set('Impossible de charger la liste. Merci de réessayer plus tard.');
        }
      },
    });
  }

  protected deconnecter(): void {
    this.session.effacer();
    this.inscrits.set([]);
    this.recherche.set('');
    this.filtreCategorie.set('');
    this.erreur.set(null);
  }

  protected rechercher(evenement: Event): void {
    this.recherche.set((evenement.target as HTMLInputElement).value);
  }

  protected filtrer(evenement: Event): void {
    this.filtreCategorie.set((evenement.target as HTMLSelectElement).value);
  }

  protected initiales(inscrit: InscriptionComplete): string {
    return `${inscrit.prenom.charAt(0)}${inscrit.nom.charAt(0)}`.toUpperCase();
  }

  protected age(inscrit: InscriptionComplete): number | null {
    return calculerAge(inscrit.dateNaissance);
  }
}
