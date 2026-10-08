import { Injectable, signal } from '@angular/core';

const CLE_STOCKAGE = 'club-foot.cle-admin';

function lire(): string | null {
  try {
    return sessionStorage.getItem(CLE_STOCKAGE);
  } catch {
    return null; // stockage indisponible (navigation privée, etc.)
  }
}

function ecrire(valeur: string | null): void {
  try {
    if (valeur === null) {
      sessionStorage.removeItem(CLE_STOCKAGE);
    } else {
      sessionStorage.setItem(CLE_STOCKAGE, valeur);
    }
  } catch {
    // stockage indisponible : la clé reste simplement en mémoire
  }
}

/** Garde la clé administrateur le temps de l'onglet (sessionStorage), jamais plus longtemps. */
@Injectable({ providedIn: 'root' })
export class AdminSession {
  readonly cle = signal<string | null>(lire());

  definir(cle: string): void {
    this.cle.set(cle);
    ecrire(cle);
  }

  effacer(): void {
    this.cle.set(null);
    ecrire(null);
  }
}
