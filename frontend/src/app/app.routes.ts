import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Club Foot – Accueil',
    loadComponent: () => import('./pages/accueil/accueil.page').then((m) => m.AccueilPage),
  },
  {
    path: 'inscription',
    title: 'Club Foot – Inscription',
    loadComponent: () =>
      import('./pages/inscription/inscription.page').then((m) => m.InscriptionPage),
  },
  {
    path: 'inscrits',
    title: 'Club Foot – Liste des inscrits',
    loadComponent: () => import('./pages/inscrits/inscrits.page').then((m) => m.InscritsPage),
  },
  { path: '**', redirectTo: '' },
];
