import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../core/models';
import { Ballon } from '../../shared/ballon';

@Component({
  selector: 'app-accueil-page',
  imports: [RouterLink, Ballon],
  templateUrl: './accueil.page.html',
  styleUrl: './accueil.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccueilPage {
  protected readonly categories = CATEGORIES;
}
