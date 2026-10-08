import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface InscriptionRequest {
  prenom: string;
  nom: string;
  dateNaissance: string;
  emailParent: string;
  telephoneParent: string;
}

export interface InscriptionResponse {
  id: number;
  prenom: string;
  nom: string;
  dateNaissance: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private readonly http = inject(HttpClient);

  creer(demande: InscriptionRequest): Observable<InscriptionResponse> {
    return this.http.post<InscriptionResponse>('/api/inscriptions', demande);
  }
}
