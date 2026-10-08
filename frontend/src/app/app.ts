import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InscriptionService } from './inscription.service';

type Champ = 'prenom' | 'nom' | 'dateNaissance' | 'emailParent' | 'telephoneParent';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InscriptionService);

  protected readonly aujourdhui = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    dateNaissance: ['', [Validators.required]],
    emailParent: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    telephoneParent: ['', [Validators.required, Validators.pattern(/^[0-9+()\s.-]{6,20}$/)]],
  });

  protected readonly envoiEnCours = signal(false);
  protected readonly confirmation = signal<string | null>(null);
  protected readonly erreurGenerale = signal<string | null>(null);
  protected readonly erreursServeur = signal<Record<string, string>>({});

  protected message(champ: Champ): string | null {
    const controle = this.form.controls[champ];
    const erreurServeur = this.erreursServeur()[champ];
    if (erreurServeur) {
      return erreurServeur;
    }
    if (!controle.invalid || !(controle.touched || controle.dirty)) {
      return null;
    }
    if (controle.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (controle.hasError('email')) {
      return 'Email invalide';
    }
    if (controle.hasError('pattern')) {
      return 'Téléphone invalide';
    }
    if (controle.hasError('maxlength')) {
      return 'Trop long';
    }
    return 'Valeur invalide';
  }

  protected soumettre(): void {
    this.confirmation.set(null);
    this.erreurGenerale.set(null);
    this.erreursServeur.set({});

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.envoiEnCours.set(true);
    this.service.creer(this.form.getRawValue()).subscribe({
      next: (reponse) => {
        this.envoiEnCours.set(false);
        this.confirmation.set(`${reponse.prenom} ${reponse.nom} est bien inscrit(e). Merci !`);
        this.form.reset();
      },
      error: (erreur: HttpErrorResponse) => {
        this.envoiEnCours.set(false);
        if (erreur.status === 400 && erreur.error?.erreurs) {
          this.erreursServeur.set(erreur.error.erreurs);
          this.erreurGenerale.set('Merci de corriger les champs indiqués.');
        } else if (erreur.status === 409) {
          this.erreurGenerale.set('Cette inscription existe déjà.');
        } else {
          this.erreurGenerale.set('Une erreur est survenue. Merci de réessayer plus tard.');
        }
      },
    });
  }
}
