import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Ballon de foot stylisé. La taille se règle avec width/height sur l'élément <app-ballon>. */
@Component({
  selector: 'app-ballon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
      line-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#08180f" stroke-width="3" />
      <polygon points="50,36 63.3,45.7 58.2,61.3 41.8,61.3 36.7,45.7" fill="#08180f" />
      <g stroke="#08180f" stroke-width="2.5" stroke-linecap="round">
        <line x1="50" y1="36" x2="50" y2="19" />
        <line x1="63.3" y1="45.7" x2="79.5" y2="40.4" />
        <line x1="58.2" y1="61.3" x2="68.2" y2="75.1" />
        <line x1="41.8" y1="61.3" x2="31.8" y2="75.1" />
        <line x1="36.7" y1="45.7" x2="20.5" y2="40.4" />
      </g>
      <g fill="#08180f">
        <circle cx="50" cy="12" r="6.5" />
        <circle cx="86.1" cy="38.3" r="6.5" />
        <circle cx="72.3" cy="80.7" r="6.5" />
        <circle cx="27.7" cy="80.7" r="6.5" />
        <circle cx="13.9" cy="38.3" r="6.5" />
      </g>
    </svg>
  `,
})
export class Ballon {}
