import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InscriptionService } from '../../core/inscription.service';
import {
  AGE_MAX,
  AGE_MIN,
  InscriptionCreee,
  calculerAge,
  categoriePourAge,
} from '../../core/models';
import { Ballon } from '../../shared/ballon';

type Champ = 'prenom' | 'nom' | 'dateNaissance' | 'emailParent' | 'telephoneParent';

@Component({
  selector: 'app-inscription-page',
  imports: [ReactiveFormsModule, RouterLink, Ballon],
  templateUrl: './inscription.page.html',
  styleUrl: './inscription.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InscriptionPage {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InscriptionService);

  protected readonly ageMin = AGE_MIN;
  protected readonly ageMax = AGE_MAX;
  protected readonly aujourdhui = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group({
    prenom: ['', [Validators.required, Validators.maxLength(100)]],
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    dateNaissance: ['', [Validators.required]],
    emailParent: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    telephoneParent: ['', [Validators.required, Validators.pattern(/^[0-9+()\s.-]{6,20}$/)]],
  });

  protected readonly dateSaisie = toSignal(this.form.controls.dateNaissance.valueChanges, {
    initialValue: '',
  });
  protected readonly categorieEstimee = computed(() =>
    categoriePourAge(calculerAge(this.dateSaisie())),
  );

  protected readonly envoiEnCours = signal(false);
  protected readonly inscrit = signal<InscriptionCreee | null>(null);
  protected readonly erreurGenerale = signal<string | null>(null);
  protected readonly erreursServeur = signal<Record<string, string>>({});

  protected message(champ: Champ): string | null {
    const erreurServeur = this.erreursServeur()[champ];
    if (erreurServeur) {
      return erreurServeur;
    }
    const controle = this.form.controls[champ];
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
        this.inscrit.set(reponse);
        this.form.reset();
      },
      error: (erreur: HttpErrorResponse) => {
        this.envoiEnCours.set(false);
        if (erreur.status === 400 && erreur.error?.erreurs) {
          this.erreursServeur.set(erreur.error.erreurs);
          this.erreurGenerale.set('Merci de corriger les champs indiqués.');
        } else if (erreur.status === 409) {
          this.erreurGenerale.set('Cet enfant est déjà inscrit avec cet email.');
        } else {
          this.erreurGenerale.set('Une erreur est survenue. Merci de réessayer plus tard.');
        }
      },
    });
  }

  protected nouvelleInscription(): void {
    this.inscrit.set(null);
  }
}
