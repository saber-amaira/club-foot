import { INestApplication } from '@nestjs/common';
import { creerValidationPipe } from './common/validation';

/** Configuration partagée entre main.ts et les tests e2e. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(creerValidationPipe());
}
