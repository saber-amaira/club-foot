import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InscriptionComplete, InscriptionCreee, NouvelleInscription } from './models';

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private readonly http = inject(HttpClient);

  creer(demande: NouvelleInscription): Observable<InscriptionCreee> {
    return this.http.post<InscriptionCreee>('/api/inscriptions', demande);
  }

  /** Réservé au club : la clé administrateur est envoyée dans l'en-tête x-admin-key. */
  lister(cleAdmin: string): Observable<InscriptionComplete[]> {
    return this.http.get<InscriptionComplete[]>('/api/inscriptions', {
      headers: { 'x-admin-key': cleAdmin },
    });
  }
}
